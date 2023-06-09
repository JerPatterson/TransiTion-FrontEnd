import { Injectable } from '@angular/core';
import { StaticTripDataService } from '@app/services/static/static-trip-data.service';
import { RealtimeDataService } from '@app/services/realtime-data.service';
import { PredictedTime, Time } from '@app/interfaces/time-concepts';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS } from '@app/constants/time';
import { StaticStopDataService } from './static/static-stop-data.service';

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {
    constructor(
        private rtDataService: RealtimeDataService,
        private staticTripDataService: StaticTripDataService,
        private staticStopDataService: StaticStopDataService,
    ) {}

    async getTimesFromStop(agencyId: string, stopId: string): Promise<Time[]> {
        const expectations = await this.getSaticTimesFromStop(agencyId, stopId);
        const predictions = await this.rtDataService.getTimesFromStop(agencyId, stopId);
        
        return this.mergeTimes(expectations, predictions);
    }

    async getTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<Time[]> {
        const expectations = await this.getStaticTimesFromStopOfRoute(agencyId, routeId, stopId);
        const predictions = await this.rtDataService.getTimesFromStopOfRoute(agencyId, routeId, stopId);

        return this.mergeTimes(expectations, predictions);
    }

    private async mergeTimes(expectations: Time[], predictions: PredictedTime[]) {
        const stopTimes: Time[] = expectations.map(expectation => {
            const prediction = predictions.find(prediction => 
                prediction.tripId === expectation.tripId
            );
            return {
                ...expectation,
                rtEpochTime: prediction?.epochTime,
                rtSecondsAhead: prediction?.secondsAhead,
                rtMinutesAhead: prediction?.minutesAhead,
            };
        });
        
        return stopTimes
            .filter(time => time.stEpochTime > Date.now())
            .sort((a, b) => a.stEpochTime - b.stEpochTime);
    }

    private async getSaticTimesFromStop(agencyId: string, stopId: string): Promise<Time[]> {
        let times: Time[] = [];
        const stop = await this.staticStopDataService.getStop(agencyId, stopId);
        for (let routeId of stop ? stop.routeIds : []) {
            times = times.concat(await this.getTimesFromStopOfRoute(agencyId, routeId, stopId));
        }

        return times;
    }

    private async getStaticTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<Time[]> {
        const times: Time[] = [];
        const trips = await this.staticTripDataService.getTodayTripsFromRoute(agencyId, routeId);
        trips.forEach(trip => {
            const staticTime = trip.times.get(stopId);
            if (staticTime) times.push(this.computeTimeObject(trip.id, routeId, staticTime.scheduledTime));
        });

        return times;
    }

    private computeTimeObject(tripId: string, routeId: string, scheduledTime: string): Time {
        const timeAhead = this.getTimeAheadInMilliseconds(scheduledTime);
        return {
            tripId, 
            routeId,
            stEpochTime: Date.now() + timeAhead,
            stSecondsAhead: Math.floor(timeAhead / ONE_SEC_IN_MS),
            stMinutesAhead: Math.floor(timeAhead / (ONE_MINUTE_IN_SEC * ONE_SEC_IN_MS)),
        }
    }

    private getTimeAheadInMilliseconds(time: string): number {
        const now = new Date(Date.now());
        const [hr, min, sec] = time.split(':').map(value => Number(value));
        const [nHr, nMin, nSec] = [now.getHours(), now.getMinutes(), now.getSeconds()];
        return this.convertTimeToMilliseconds(hr, min, sec) - this.convertTimeToMilliseconds(nHr, nMin, nSec);
    }

    private convertTimeToMilliseconds(hours: number, minutes: number, seconds: number): number {
        return ((hours * ONE_HOUR_IN_MIN + minutes) * ONE_MINUTE_IN_SEC + seconds) * ONE_SEC_IN_MS;
    }
}

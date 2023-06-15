import { Injectable } from '@angular/core';
import { RealtimeDataService } from '@app/services/realtime/realtime-data.service';
import { PredictedTime, Time } from '@app/interfaces/time-concepts';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS } from '@app/constants/time';
import { StaticDataService } from '@app/services/static/static-data.service';

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {
    constructor(
        private stDataService: StaticDataService,
        private rtDataService: RealtimeDataService
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
        const times = await this.stDataService.getTimesFromStop(agencyId, stopId);
        return times.map((time) => this.computeTimeObject(time.trip_id, time.trip ? time.trip.route_id : '', time.arrival_time))
    }

    private async getStaticTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<Time[]> {
        const times = await this.stDataService.getTimesFromStopOfRoute(agencyId, routeId, stopId);
        return times.map((time) => this.computeTimeObject(time.trip_id, routeId, time.arrival_time))
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

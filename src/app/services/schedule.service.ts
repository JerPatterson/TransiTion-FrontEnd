import { Injectable } from '@angular/core';
import { StaticTripDataService } from './static-trip-data.service';
import { RealtimeDataService } from './realtime-data.service';
import { PredictedTime, ScheduledTime, Time } from '@app/interfaces/concepts';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS } from '@app/constants/time';

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {
    constructor(
        private stTripDataService: StaticTripDataService,
        private rtDataService: RealtimeDataService,
    ) {}

    async getTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<Time[]> {
        const expectations = await this.stTripDataService.getTimesFromStopOfRoute(agencyId, routeId, stopId);
        const predictions = await this.rtDataService.getTimesFromStopOfRoute(agencyId, routeId, stopId);
        
        const stopTimes: Time[] = expectations.map(expectation => {
            const prediction = predictions.find(prediction => 
                prediction.tripId === expectation.tripId && expectation?.stopId.includes(stopId));
            return this.computeTimeObject(expectation, prediction);
        });
        
        return stopTimes
            .filter(time => time.stEpochTime > Date.now())
            .sort((a, b) => a.stEpochTime - b.stEpochTime);
    }

    async getTimesFromStop(agencyId: string, stopId: string): Promise<Time[]> {
        const expectations = await this.stTripDataService.getTimesFromStop(agencyId, stopId);
        const predictions = await this.rtDataService.getTimesFromStop(agencyId, stopId);
        
        const stopTimes: Time[] = expectations.map(expectation => {
            const prediction = predictions.find(prediction => {
                return prediction.tripId === expectation.tripId;
            });
            return this.computeTimeObject(expectation, prediction);
        });

        return stopTimes
            .filter(time => time.stEpochTime > Date.now())
            .sort((a, b) => a.stEpochTime - b.stEpochTime);
    }

    private computeTimeObject(stData: ScheduledTime, rtData?: PredictedTime): Time {
        const timeAhead = this.getTimeAheadInMilliseconds(stData.scheduledTime);
        return {
            tripId: stData.tripId,
            shapeId: stData.shapeId,
            stopId: stData.stopId,
            routeId: stData.routeId,
            stEpochTime: Date.now() + timeAhead,
            stSecondsAhead: Math.floor(timeAhead / ONE_SEC_IN_MS),
            stMinutesAhead: Math.floor(timeAhead / (ONE_MINUTE_IN_SEC * ONE_SEC_IN_MS)),
            rtEpochTime: rtData?.epochTime,
            rtSecondsAhead: rtData?.secondsAhead,
            rtMinutesAhead: rtData?.minutesAhead,
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

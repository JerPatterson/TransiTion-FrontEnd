import { Injectable } from '@angular/core';
import { StaticDataService } from './static-data.service';
import { RealtimeDataService } from './realtime-data.service';
import { PredictedTime, ScheduledTime, Time } from '@app/interfaces/concepts';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS } from '@app/constants/time';

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {
    constructor(
        private stDataService: StaticDataService,
        private rtDataService: RealtimeDataService,
    ) {}

    async getTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<Time[][]> {
        const trips = await this.stDataService.getTodayTripsFromRoute(agencyId, routeId);
        const predictions = await this.rtDataService.getTimesFromStopOfRoute(agencyId, routeId, stopId);
        
        const times = trips.map(trip => {
            return trip.times.map(time => {
                const prediction = predictions.find(pred => 
                    pred.tripId === trip.id && time.stopId.includes(stopId));
                return this.computeTimeObject(time, prediction);
            });
        });

        return times
            .filter(trip => trip[0].stEpochTime > Date.now())
            .sort((a, b) => a[0].stEpochTime - b[0].stEpochTime);
    }

    private computeTimeObject(stData: ScheduledTime, rtData?: PredictedTime): Time {
        const timeAhead = this.getTimeAheadInMilliseconds(stData.scheduledTime);
        return {
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

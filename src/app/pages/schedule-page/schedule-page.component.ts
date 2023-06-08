import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ACCEPTABLE_DELAY_IN_SEC, ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC } from '@app/constants/time';
import { TripArrivalState } from '@app/enums/states';
import { Time } from '@app/interfaces/concepts';
import { ScheduleService } from '@app/services/schedule.service';

@Component({
    selector: 'app-schedule-page',
    templateUrl: './schedule-page.component.html',
    styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent {
    times: Time[] = [];

    agencyId: string | undefined;
    routeId: string | undefined;
    stopId: string | undefined;
    timeSelected: Time | undefined;

    constructor(
        private route: ActivatedRoute,
        private scheduleService: ScheduleService,
    ) {
        this.setTimes();
    }

    async setTimes() {
        const agencyId = this.route.snapshot.paramMap.get('agency-name');
        const routeId = this.route.snapshot.paramMap.get('route-id');
        const stopId = this.route.snapshot.paramMap.get('stop-id');

        if (!agencyId || !stopId) return;
        this.agencyId = agencyId;
        this.stopId = stopId;

        if (routeId) {
            this.routeId = routeId;
            this.times = await this.scheduleService.getTimesFromStopOfRoute(agencyId, routeId, stopId);
        } else {
            this.times = await this.scheduleService.getTimesFromStop(agencyId, stopId);
        }

        this.timeSelected = this.times[0];
        this.routeId = this.times[0].routeId;
    }

    onClick(time: Time) {
        this.timeSelected = time;
        this.routeId = time.routeId;
    }

    formatTimeToWait(minutes: number, seconds: number): string {
        let stringContent = '';
        if (minutes >= ONE_HOUR_IN_MIN)
            stringContent += `${Math.floor(minutes / ONE_HOUR_IN_MIN)}hr `;
        
        const waitMin = minutes % ONE_HOUR_IN_MIN;
        const waitSec = seconds - minutes * ONE_MINUTE_IN_SEC;
        stringContent += `${this.convertToTwoDigit(waitSec < 0 ? waitMin - 1 : waitMin)}min `;
        stringContent += `${this.convertToTwoDigit(waitSec < 0 ? ONE_MINUTE_IN_SEC + waitSec : waitSec)}s`

        return stringContent;
    }

    formatTimeDifference(time: Time): string {
        if (!time.rtMinutesAhead || !time.rtSecondsAhead) return ' ';
        const minutes = Math.abs(time.stMinutesAhead - time.rtMinutesAhead);
        const seconds = Math.abs(time.stSecondsAhead - time.rtSecondsAhead);
        return this.formatTimeToWait(minutes, seconds);
    }

    getTripArrivalState(time: Time): TripArrivalState {
        if (time.rtSecondsAhead === undefined) return TripArrivalState.Unknown;
        const difference = time.rtSecondsAhead - time.stSecondsAhead;
        if (difference < -ACCEPTABLE_DELAY_IN_SEC) 
            return TripArrivalState.Early;
        else if (difference > ACCEPTABLE_DELAY_IN_SEC)
            return TripArrivalState.Late;
        else
            return TripArrivalState.OnTime;
    }

    private convertToTwoDigit(number: number) {
        return number > 9 ? number : '0' + number;
    }
}

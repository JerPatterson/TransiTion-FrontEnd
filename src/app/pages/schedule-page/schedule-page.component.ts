import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC } from '@app/constants/time';
import { Time } from '@app/interfaces/concepts';
import { ScheduleService } from '@app/services/schedule.service';

@Component({
    selector: 'app-schedule-page',
    templateUrl: './schedule-page.component.html',
    styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent {
    mergeTimes: Time[][] = [];

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
        console.log('here');

        if (!agencyId || !routeId || !stopId) return;

        console.log('here');
        this.mergeTimes = await this.scheduleService.getTimesFromStopOfRoute(agencyId, routeId, stopId)
    }

    formatTimeToWait(minutes: number, seconds: number): string {
        let stringContent = '';
        if (minutes >= ONE_HOUR_IN_MIN)
            stringContent += `${Math.floor(minutes / ONE_HOUR_IN_MIN)}hr `;
        
        const waitMin = minutes % ONE_HOUR_IN_MIN;
        const waitSec = seconds - minutes * ONE_MINUTE_IN_SEC;
        stringContent += `${this.convertToTwoDigit(waitSec < 0 ? waitMin - 1 : waitMin)}min `;
        stringContent += `${this.convertToTwoDigit(waitSec < 0 ? ONE_MINUTE_IN_SEC + waitSec : waitSec)}sec`

        return stringContent;
    }

    private convertToTwoDigit(number: number) {
        return number > 9 ? number : '0' + number;
    }
}

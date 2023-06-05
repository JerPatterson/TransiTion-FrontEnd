import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC } from '@app/constants/time';
import { Stop, Time } from '@app/interfaces/concepts';
import { ScheduleService } from '@app/services/schedule.service';
import { StaticDataService } from '@app/services/static-data.service';

@Component({
    selector: 'app-schedule-page',
    templateUrl: './schedule-page.component.html',
    styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent {
    times: Time[] = [];
    stops: Map<string, Stop> = new Map();

    constructor(
        private route: ActivatedRoute,
        private stDataService: StaticDataService,
        private scheduleService: ScheduleService,
    ) {
        this.setTimes();
        this.setStops();
    }

    async setTimes() {
        const agencyId = this.route.snapshot.paramMap.get('agency-name');
        const routeId = this.route.snapshot.paramMap.get('route-id');
        const stopId = this.route.snapshot.paramMap.get('stop-id');

        if (!agencyId || !routeId || !stopId) return;
        this.times = await this.scheduleService.getTimesFromStopOfRoute(agencyId, routeId, stopId)
    }

    async setStops() {
        const agencyId = this.route.snapshot.paramMap.get('agency-name');

        if (!agencyId) return;
        (await this.stDataService.getStopsFromAgency(agencyId)).forEach(stop =>
            this.stops.set(stop.id, stop)
        );
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

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RealtimeDataService } from '@app/services/realtime-data.service';
import { StaticDataService } from '@app/services/static-data.service';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC } from '@app/constants/time';
import { ScheduledTime, Time } from '@app/interfaces/concepts';

@Component({
    selector: 'app-schedule-page',
    templateUrl: './schedule-page.component.html',
    styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent {
    mergeTimes: { rt: Time, st: ScheduledTime }[] = [];

    constructor(
        private route: ActivatedRoute,
        private stDataService: StaticDataService,
        private rtDataService: RealtimeDataService,
    ) {
        this.setTimes();
    }

    async setTimes() {
        const agencyId = this.route.snapshot.paramMap.get('agency-name');
        const routeId = this.route.snapshot.paramMap.get('route-id');
        const stopId = this.route.snapshot.paramMap.get('stop-id');
        
        if (!agencyId || !stopId) return;

        let predictedTimes: Time[] = [];
        if (routeId) () => {};
        else  predictedTimes = await this.rtDataService.getTimesFromStop(agencyId, stopId);
        predictedTimes.forEach(async (predictedTime) => {
            const st = (await this.stDataService.getTimesFromTripId(agencyId, 'MARS23' + predictedTime.tripId))
                .times.find(time => time.stopId.includes(stopId));
            if (st) this.mergeTimes.push({ rt: predictedTime, st });
        })
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

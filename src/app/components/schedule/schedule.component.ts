import { Component, Input } from '@angular/core';
import { Time } from '../../interfaces/transit-concept'
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS } from 'src/app/constants/time';
import { RealTimeDataService } from 'src/app/services/real-time-data.service';
import { StaticDataService } from 'src/app/services/static-data.service';

@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
    @Input() routeTag: string;
    @Input() stopTag: string;

    times: Time[];
    expectedTimes: Time[];
    
    constructor(private readonly rtDataService: RealTimeDataService, private readonly stDataService: StaticDataService) {
        this.routeTag = '';
        this.stopTag = '';
        this.times = [];
        this.expectedTimes = [];
    }

    async ngOnChanges() {
        if (!this.routeTag || !this.stopTag) return;
        this.getTimeList();
        this.getTimeExpectedList();
    }

    async getTimeList(): Promise<void> {
        this.times = (await this.rtDataService.getTimeList(
            this.routeTag, 
            this.stopTag.includes('CP') ? this.stopTag.slice(2) : this.stopTag
        )).map(time => { return {
            epochTime: time.epochTime,
            secondsAhead: time.seconds,
            minutesAhead: time.minutes,
        }});
    }

    async getTimeExpectedList() {
        this.expectedTimes = await this.stDataService.getTimeListFromRouteStop(this.routeTag, this.stopTag);
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

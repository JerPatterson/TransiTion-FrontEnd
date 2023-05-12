import { Component, Input } from '@angular/core';
import { Time } from '../../interfaces/transit-concept'
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC } from 'src/app/constants/time';
import { RealTimeDataService } from 'src/app/services/real-time-data.service';
import { StaticDataService } from 'src/app/services/static-data.service';
import { Filter } from 'src/app/enums/filter';

@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
    @Input() filter: Filter;
    @Input() routeTag: string;
    @Input() stopTag: string;

    mergeTimes: { rt?: Time; st: Time }[];
    
    constructor(
        private readonly stDataService: StaticDataService,
        private readonly rtDataService: RealTimeDataService,
    ) {
        this.filter = Filter.Default;
        this.routeTag = '';
        this.stopTag = '';
        this.mergeTimes = [];
    }

    async ngOnChanges() {
        switch (this.filter) {
            case Filter.Stops:
                if (!this.stopTag) return;
                this.routeTag = '';
                this.getTimesFromStop();
                break;
            case Filter.Routes:
                if (!this.routeTag) return;
                this.stopTag = '';
                this.getTimesFromRoute();
                break;
            default:
                if (!this.routeTag || !this.stopTag) return;
                this.getTimesFromStopOfRoute();
        }
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

    private async computeMergeTimes(times: Time[], expectedTimes: Time[]): Promise<void> {
        this.mergeTimes = expectedTimes.map((st) => {
           const rt = times.find((time) => st.tripTag.includes(time.tripTag));
           return { rt, st };
        });
    }
 
    private async getTimesFromStopOfRoute(): Promise<void> {
        const times = await this.rtDataService.getTimesFromStopOfRoute(this.routeTag, this.stopTag.replace('CP', ''));
        const expectedTimes = await this.stDataService.getTimesFromStopOfRoute(this.routeTag, this.stopTag);
        await this.computeMergeTimes(times, expectedTimes);
    }

    private async getTimesFromStop(): Promise<void> {
        const times = await this.rtDataService.getTimesFromStop(this.stopTag.replace('CP', ''));
        const expectedTimes = await this.stDataService.getTimesFromStop(this.stopTag);
        await this.computeMergeTimes(times, expectedTimes);
    }

    private async getTimesFromRoute(): Promise<void> {
        const expectedTimes = await this.stDataService.getTimesFromRoute(this.routeTag);
        await this.computeMergeTimes([], expectedTimes);
    }

    private convertToTwoDigit(number: number) {
        return number > 9 ? number : '0' + number;
    }
}

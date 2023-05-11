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

    times: Time[];
    expectedTimes: Time[];
    
    constructor(
        private readonly stDataService: StaticDataService,
        private readonly rtDataService: RealTimeDataService,
    ) {
        this.filter = Filter.Default;
        this.routeTag = '';
        this.stopTag = '';
        this.times = [];
        this.expectedTimes = [];
    }

    async ngOnChanges() {
        switch (this.filter) {
            case Filter.Stops:
                this.getTimesFromStop();
                this.getTimesExpectedFromStop();
                break;
            case Filter.Routes:
                this.getTimesFromRoute();
                this.getTimesExpectedFromRoute();
                break;
            default:
                this.getTimesFromStopOfRoute();
                this.getTimesExpectedFromStopOfRoute();
                break;
        }
    }

    async getTimesFromStop(): Promise<void> {
        this.times = (await this.rtDataService.getTimesFromStop(
            this.stopTag.replace('CP', ''),
        )).map(time => { 
            return {
                epochTime: time.epochTime,
                secondsAhead: time.seconds,
                minutesAhead: time.minutes,
            }
        });
    }

    async getTimesExpectedFromStop(): Promise<void> {
        this.expectedTimes = []; // TODO
    }

    async getTimesFromRoute(): Promise<void> {
        this.times = []; // TODO
    }

    async getTimesExpectedFromRoute(): Promise<void> {
        this.expectedTimes = await this.stDataService.getTimesFromRoute(this.routeTag);
    }

    async getTimesFromStopOfRoute(): Promise<void> {
        this.times = (await this.rtDataService.getTimesFromStopOfRoute(
            this.routeTag, this.stopTag.replace('CP', ''),
        )).map(time => { 
            return {
                epochTime: time.epochTime,
                secondsAhead: time.seconds,
                minutesAhead: time.minutes,
            }
        });
    }

    async getTimesExpectedFromStopOfRoute() {
        this.expectedTimes = await this.stDataService.getTimesFromStopOfRoute(this.routeTag, this.stopTag);
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

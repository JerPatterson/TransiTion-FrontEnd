import { Component, Input } from '@angular/core';
import { Time } from 'src/app/interfaces/real-time-communications';
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
        this.times = await this.rtDataService.getTimeList(
            this.routeTag, 
            this.stopTag.includes('CP') ? this.stopTag.slice(2) : this.stopTag
        );
    }

    async getTimeExpectedList() {
        this.expectedTimes = await this.stDataService.getTimeExpectedList(this.routeTag, this.stopTag);
    }

    formatTimeToWait(minutes: number, seconds: number): string {
        const TIME_FACTOR = 60;
    
        let stringContent = '';
        if (minutes >= TIME_FACTOR)
            stringContent += `${Math.floor(minutes / TIME_FACTOR)}hr `;
        stringContent += `${this.convertToTwoDigit(minutes % TIME_FACTOR)}min `;
        stringContent += `${this.convertToTwoDigit(seconds - minutes * TIME_FACTOR)}sec`

        return stringContent;
    }

    private convertToTwoDigit(number: number) {
        return number > 9 ? number : '0' + number;
    }
}

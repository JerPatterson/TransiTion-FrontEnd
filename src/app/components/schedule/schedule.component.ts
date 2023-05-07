import { Component, Input } from '@angular/core';
import { Prediction } from 'src/app/interfaces/real-time-communications';
import { RealTimeDataService } from 'src/app/services/real-time-data.service';

@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
    @Input() routeTag: string;
    @Input() stopTag: string;

    predictions: Prediction[];
    
    constructor(private readonly rtDataService: RealTimeDataService) {
        this.routeTag = '';
        this.stopTag = '';
        this.predictions = [];
    }

    ngOnChanges() {
        this.getPredictionList();
    }

    async getPredictionList(): Promise<void> {
        if (this.routeTag && this.stopTag) {
            this.predictions = await this.rtDataService.getPredictionList(
                this.routeTag, 
                this.stopTag.includes('CP') ? this.stopTag.slice(2) : this.stopTag
            );
        } else {
            this.predictions = [];
        }
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

import { Component, Input, OnChanges } from '@angular/core';
import { ONE_HOUR_IN_MIN } from '@app/utils/constants';
import { RouteDto, TimeDto } from '@app/utils/dtos';

@Component({
    selector: 'app-time',
    templateUrl: './time.component.html',
    styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnChanges {
    @Input() time!: TimeDto;
    @Input() route!: RouteDto | undefined;

    @Input() applyOldStyle: boolean = false;

    timeString!: string;
    isInThePast!: boolean;

    ngOnChanges() {
        this.setArrivalTimeValue();
        this.setIsInThePastValue();
    }

    private setArrivalTimeValue(): void {
        this.timeString = `
            ${this.time.arrival_time.slice(0, 2)}h 
            ${this.time.arrival_time.slice(3, 5)}`
    }

    private setIsInThePastValue(): void {
        const now = new Date(Date.now());
        const hours = this.time.arrival_time.slice(0, 2); 
        const minutes = this.time.arrival_time.slice(3, 5);
        const arrivalTimeInMinutes = Number(hours) * ONE_HOUR_IN_MIN + Number(minutes);
        const nowTimeInMinutes = now.getHours() * ONE_HOUR_IN_MIN + now.getMinutes();
        
        this.isInThePast = nowTimeInMinutes > arrivalTimeInMinutes;
    }
}

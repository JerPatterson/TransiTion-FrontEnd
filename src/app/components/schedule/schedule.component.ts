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
    @Input() stopId: string;

    predictions: Prediction[];
    
    constructor(private rtDataService: RealTimeDataService) {
        this.routeTag = '';
        this.stopId = '';
        this.predictions = [];
    }

    ngOnChanges() {
        this.getPredictionList();
    }

    getPredictionList(): void {
        this.predictions = this.rtDataService.getPredictionList(this.routeTag, this.stopId);
    }
}

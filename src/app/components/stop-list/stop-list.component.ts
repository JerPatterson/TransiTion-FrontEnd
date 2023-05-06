import { Component } from '@angular/core';
import { Stop } from '../../interfaces/real-time-communications';
import { RealTimeDataService } from '../../services/real-time-data.service';

@Component({
    selector: 'app-stop-list',
    templateUrl: './stop-list.component.html',
    styleUrls: ['./stop-list.component.css']
})
export class StopListComponent {
    stops: Stop[];
    
    constructor(rtDataService: RealTimeDataService) {
        this.stops = rtDataService.getStopList('31N');
    }
}

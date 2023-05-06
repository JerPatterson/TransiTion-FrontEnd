import { Component } from '@angular/core';
import { Route } from '../interfaces/real-time-communications';
import { RealTimeDataService } from '../services/real-time-data.service';

@Component({
    selector: 'route-list',
    templateUrl: './route-list.component.html',
    styleUrls: ['./route-list.component.css']
})
export class RouteListComponent {
    routes: Route[];

    constructor(rtDataService: RealTimeDataService) {
        this.routes = rtDataService.getRouteList();
    }
}

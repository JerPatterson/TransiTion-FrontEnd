import { Component, EventEmitter, Output } from '@angular/core';
import { Route } from '../../interfaces/real-time-communications';
import { RealTimeDataService } from '../../services/real-time-data.service';

@Component({
    selector: 'app-route-list',
    templateUrl: './route-list.component.html',
    styleUrls: ['./route-list.component.css']
})
export class RouteListComponent {
    @Output() newRouteTag: EventEmitter<string>;

    routes: Route[];

    constructor(rtDataService: RealTimeDataService) {
        this.newRouteTag = new EventEmitter<string>();
        this.routes = rtDataService.getRouteList();
    }

    routeChange(event: Event): void {
        const tag = (event.target as any).value;
        if (tag) this.newRouteTag.emit(tag);
    }
}

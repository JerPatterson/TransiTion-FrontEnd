import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { rtRoute } from '../../interfaces/real-time-communications';
import { RealTimeDataService } from '../../services/real-time-data.service';

@Component({
    selector: 'app-route-list',
    templateUrl: './route-list.component.html',
    styleUrls: ['./route-list.component.css']
})
export class RouteListComponent implements AfterViewInit {
    @Output() newRouteTag: EventEmitter<string>;

    routes: rtRoute[];

    constructor(private readonly rtDataService: RealTimeDataService) {
        this.newRouteTag = new EventEmitter<string>();
        this.routes = [];
    }

    async ngAfterViewInit(): Promise<void> {
        this.routes = await this.rtDataService.getRouteList();
    }

    routeChange(event: Event): void {
        const routeTag = (event.target as any).value;
        if (routeTag) this.newRouteTag.emit(routeTag);
    }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteDto } from '@app/utils/dtos';

@Component({
    selector: 'app-route-list',
    templateUrl: './route-list.component.html',
    styleUrls: ['./route-list.component.css']
})
export class RouteListComponent implements OnInit {
    routes: RouteDto[] = [];

    @Input() agencyId: string = '';
    @Input() routeId: string = '';
    @Output() newRouteId = new EventEmitter<string>();

    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setRoutes();
    }

    onClick(agencyId: string) {
        this.newRouteId.emit(agencyId);
    }

    private async setRoutes() {
        if (this.agencyId) {
            this.routes = (await this.staticDataService.getRoutes(this.agencyId))
                .sort((a, b) => {
                    const aNumber = a.route_id.match(/\d+/)?.[0];
                    const bNumber = b.route_id.match(/\d+/)?.[0];
                    return aNumber && bNumber ? parseInt(aNumber, 10) - parseInt(bNumber, 10) : 0;
                });
        }
    }
}
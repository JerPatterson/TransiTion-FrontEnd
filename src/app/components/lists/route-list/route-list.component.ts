import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteListType } from '@app/utils/component-interface';

@Component({
    selector: 'app-route-list',
    templateUrl: './route-list.component.html',
    styleUrls: ['./route-list.component.css']
})
export class RouteListComponent implements OnInit {    
    elements: RouteListType[] = [];
    routeIds = new Set<string>();
    hideAgencies = new Set<string>();

    @Input() agencyIds: string[] = [];
    @Input() selections: string[] = [];

    @Output() addRouteId = new EventEmitter<string>();
    @Output() removeRouteId = new EventEmitter<string>();

    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setRoutes();
        this.selections.forEach((routeId) => this.routeIds.add(routeId));
    }

    onAgencyClick(agencyId: string) {
        if (this.hideAgencies.has(agencyId)) {
            this.hideAgencies.delete(agencyId);
        } else {
            this.hideAgencies.add(agencyId);
        }
    }

    onRouteClick(agencyId: string, routeId: string) {
        const uniqueRouteId = `${agencyId}/${routeId}`;
        if (this.routeIds.has(uniqueRouteId)) {
            this.routeIds.delete(uniqueRouteId);
            this.removeRouteId.emit(uniqueRouteId);
        } else {
            this.routeIds.add(uniqueRouteId);
            this.addRouteId.emit(uniqueRouteId);
        }
    }

    private async setRoutes() {
        this.elements = await Promise.all(this.agencyIds.map(async (agencyId) => {
            return {
                agency: await this.staticDataService.getAgencyById(agencyId),
                routes: (await this.staticDataService.getRoutes(agencyId))
                .sort((a, b) => {
                    const aNumber = a.route_id.match(/\d+/)?.[0];
                    const bNumber = b.route_id.match(/\d+/)?.[0];
                    return aNumber && bNumber ? 
                        parseInt(aNumber, 10) - parseInt(bNumber, 10) : 0;
                }),
            };
        }));
    }
}

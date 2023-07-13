import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteListType } from '@app/utils/component-interface';
import { RouteDto } from '@app/utils/dtos';

@Component({
    selector: 'app-route-list',
    templateUrl: './route-list.component.html',
    styleUrls: ['./route-list.component.css']
})
export class RouteListComponent implements OnInit {    
    elements: RouteListType[] = [];
    routeIds = new Set<string>();
    showAgencies = new Set<string>();

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
        if (this.showAgencies.has(agencyId)) {
            this.showAgencies.delete(agencyId);
        } else {
            this.showAgencies.add(agencyId);
        }
    }

    onRouteClick(agencyId: string, routes: RouteDto[]) {
        routes.forEach((route) => {
            const uniqueRouteId = `${agencyId}/${route.route_id}`;
            if (this.routeIds.has(uniqueRouteId)) {
                this.routeIds.delete(uniqueRouteId);
                this.removeRouteId.emit(uniqueRouteId);
            } else {
                this.routeIds.add(uniqueRouteId);
                this.addRouteId.emit(uniqueRouteId);
            }
        });
    }

    private async setRoutes() {
        this.elements = await Promise.all(this.agencyIds.map(async (agencyId) => {
            return {
                agency: await this.staticDataService.getAgencyById(agencyId),
                routes: (await this.getUniqueRoutes(agencyId))
                    .sort((a, b) => {
                        const aNumber = a[0].route_id.match(/\d+/)?.[0];
                        const bNumber = b[0].route_id.match(/\d+/)?.[0];
                        return aNumber && bNumber ? 
                            parseInt(aNumber, 10) - parseInt(bNumber, 10) : 0;
                    }),
            };
        }));
    }

    private async getUniqueRoutes(agencyId: string): Promise<RouteDto[][]> {
        const uniqueRoutes = new Map<string, RouteDto[]>();
        (await this.staticDataService.getRoutes(agencyId))
            .forEach((route) => {
                const array = uniqueRoutes.get(route.route_short_name);
                if (array) { 
                    const longName = `${array[0].route_long_name} ⇄ ${route.route_long_name}`;
                    array[0] = {...array[0], route_long_name: longName };
                    uniqueRoutes.set(route.route_short_name, array.concat([route]))
                } else {
                    uniqueRoutes.set(route.route_short_name, [route]);
                }
            });
        const result: RouteDto[][] = [];
        uniqueRoutes.forEach((routes) => { result.push(routes) });
        return result;
    }
}

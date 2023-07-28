import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteId } from '@app/utils/component-interface';
import { AgencyDto, RouteDto } from '@app/utils/dtos';
import { AgencyRouteElement } from '@app/utils/list.components';

@Component({
    selector: 'app-route-list',
    templateUrl: './route-list.component.html',
    styleUrls: ['./route-list.component.css']
})
export class RouteListComponent {    
    routes: AgencyRouteElement[] = [];
    routeIdsSelected = new Set<string>();
    agencyIdsSelected = new Set<string>();

    @Input() set agencyIds(values: string[]) {
        this.setRoutes(values);
    };

    @Input() set selections(values: RouteId[]) {
        this.routeIdsSelected = new Set();
        values.forEach((selection) =>
            this.routeIdsSelected.add(`${selection.agencyId}/${selection.routeId}`));
    };

    @Output() addRouteId = new EventEmitter<RouteId>();
    @Output() removeRouteId = new EventEmitter<RouteId>();

    constructor(private staticDataService: StaticDataService) {}


    onAgencyClick(agencyId: string) {
        if (this.agencyIdsSelected.has(agencyId)) {
            this.agencyIdsSelected.delete(agencyId);
        } else {
            this.agencyIdsSelected.add(agencyId);
        }
    }

    onRouteClick(agencyId: string, route: RouteDto) {
        route.route_id.split('/')
            .forEach((routeId) => {
                const uniqueRouteId = `${agencyId}/${routeId}`;
                if (this.routeIdsSelected.has(uniqueRouteId)) {
                    this.routeIdsSelected.delete(uniqueRouteId);
                    this.removeRouteId.emit({ agencyId, routeId });
                } else {
                    this.routeIdsSelected.add(uniqueRouteId);
                    this.addRouteId.emit({ agencyId, routeId });
                }
            });
    }

    private async setRoutes(agencyIds: string[]) {
        this.routes = await Promise.all(
            agencyIds.map(async (agencyId) => {
                return {
                    agency: await this.staticDataService.getAgencyById(agencyId) as AgencyDto,
                    routes: (await this.getUniqueRoutesByShortName(agencyId))
                        .sort((a, b) => {
                            const aNumber = a.route_id.match(/\d+/)?.[0];
                            const bNumber = b.route_id.match(/\d+/)?.[0];
                            return aNumber && bNumber ? 
                                parseInt(aNumber, 10) - parseInt(bNumber, 10) : 0;
                        }),
                };
            })
        );
    }

    private async getUniqueRoutesByShortName(agencyId: string): Promise<RouteDto[]> {
        const uniqueRoutes = new Map<string, RouteDto>();
        (await this.staticDataService.getRoutes(agencyId))
            .forEach((route) => {
                const previousRoute = uniqueRoutes.get(route.route_short_name);
                if (previousRoute) { 
                    const newLongName = `${previousRoute.route_long_name} ⇄ ${route.route_long_name}`;
                    route = {
                        ...previousRoute,
                        route_id: `${previousRoute.route_id}/${route.route_id}`,
                        route_long_name: newLongName,
                    };
                }
                uniqueRoutes.set(route.route_short_name, route);
            });

        const result: RouteDto[] = [];
        uniqueRoutes.forEach((routes) => { result.push(routes) });
        return result;
    }
}

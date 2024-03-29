import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouteId, StopId } from '@app/utils/component-interface';
import { AgencyRouteStopsElement, AgencyStopsElement } from '@app/utils/list.components';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteDto, StopDto } from '@app/utils/dtos';

@Component({
    selector: 'app-stop-list',
    templateUrl: './stop-list.component.html',
    styleUrls: ['./stop-list.component.css']
})
export class StopListComponent {
    stops: AgencyStopsElement[] = [];
    routeStops: AgencyRouteStopsElement[] = [];

    stopIdsSelected = new Set<string>();
    routeIdsSelected = new Set<string>();
    agencyIdsSelected = new Set<string>();

    agencyIdsToShow = new Set<string>();
    routeIdsToShow = new Set<string>();

    private knownAgencyIds = new Set<string>();
    private knownRouteIds = new Set<string>();

    @Input() set agencyIds(values: string[]) {
        this.setStops(values);
        this.agencyIdsToShow = new Set(values);
    };

    @Input() set routeIds(values: RouteId[]) {
        this.setRouteStops(values);
        this.routeIdsToShow = new Set(
            values.map(value => `${value.agencyId}/${value.routeId}`)
        );
    };

    @Input() set selections(values: StopId[]) {
        this.stopIdsSelected = new Set(
            values.map((value) => `${value.agencyId}/${value.stopId}`)
        );
    };

    @Input() set clearAll(length: number) {
        if (!length) this.stopIdsSelected.clear();
    };


    @Output() removeStopId = new EventEmitter<StopId>();
    @Output() addStopId = new EventEmitter<StopId>();

    constructor(private staticDataService: StaticDataService) {}
    

    trackByStop = (_: number, stop: StopDto) => stop.stop_id;

    onAgencyClick(agencyId: string): void {
        if (this.agencyIdsSelected.has(agencyId)) {
            this.agencyIdsSelected.delete(agencyId);
        } else {
            this.agencyIdsSelected.add(agencyId);
        }
    }

    onRouteClick(agencyId: string, routeId: string): void {
        const uniqueRouteId = `${agencyId}/${routeId}`;
        if (this.routeIdsSelected.has(uniqueRouteId)) {
            this.routeIdsSelected.delete(uniqueRouteId);
        } else {
            this.routeIdsSelected.add(uniqueRouteId);
        }
    }

    onStopClick(agencyId: string, stopId: string): void {
        const uniqueStopId = `${agencyId}/${stopId}`;
        if (this.stopIdsSelected.has(uniqueStopId)) {
            this.stopIdsSelected.delete(uniqueStopId);
            this.removeStopId.emit({ agencyId, stopId });
        } else {
            this.stopIdsSelected.add(uniqueStopId);
            this.addStopId.emit({ agencyId, stopId });
        }
    }

    private async setStops(agencyIds: string[]): Promise<void> {
        this.stops = this.stops.concat(await Promise.all(
            agencyIds
                .filter((agencyId) =>
                    !this.knownAgencyIds.has(agencyId)
                ).map(async (agencyId) => {
                    this.knownAgencyIds.add(agencyId);
                    return {
                        agency: await this.staticDataService.getAgencyById(agencyId),
                        stops: await this.staticDataService.getStopsFromAgency(agencyId),
                    };
                })
        ));
    }

    private async setRouteStops(routeIds: RouteId[]): Promise<void> {
        routeIds = routeIds.filter((routeId) =>
            !this.knownRouteIds.has(`${routeId.agencyId}/${routeId.routeId}`)
        );

        const uniqueRouteShortName = new Map<string, AgencyRouteStopsElement>();
        for (const routeId of routeIds) {
            this.knownRouteIds.add(`${routeId.agencyId}/${routeId.routeId}`);
            const route = await this.staticDataService.getRouteById(routeId.agencyId, routeId.routeId) as RouteDto;
            const stops = (await this.staticDataService.getStopByIds(routeId.agencyId, route.stop_ids))
                .map((stop) => {
                    return {
                        ...stop,
                        route_ids: stop.route_ids.filter((value) => value != routeId.routeId),
                    }
                });
            
            const routeStops = uniqueRouteShortName.get(`${routeId.agencyId}/${route.route_short_name}`);
            if (routeStops) {
                routeStops.stops = routeStops.stops.concat(stops)
                uniqueRouteShortName.set(`${routeId.agencyId}/${route.route_short_name}`, routeStops);
            } else {
                uniqueRouteShortName.set(`${routeId.agencyId}/${route.route_short_name}`, { route, stops });
            }
        }

        uniqueRouteShortName.forEach((routeStops) => {
            this.routeStops.push(routeStops);
        });
    }
}

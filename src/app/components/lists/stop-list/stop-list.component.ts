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

    stopIdSelected?: string;
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

    @Input() set selection(value: StopId) {
        this.stopIdSelected = `${value.agencyId}/${value.stopId}`;
    };

    @Output() clearStopId = new EventEmitter<void>();
    @Output() newStopId = new EventEmitter<StopId>();

    constructor(private staticDataService: StaticDataService) {}
    

    trackByStop = (_: number, stop: StopDto) => stop.stop_id;

    onAgencyClick(agencyId: string) {
        if (this.agencyIdsSelected.has(agencyId)) {
            this.agencyIdsSelected.delete(agencyId);
        } else {
            this.agencyIdsSelected.add(agencyId);
        }
    }

    onRouteClick(agencyId: string, routeId: string) {
        if (this.routeIdsSelected.has(`${agencyId}/${routeId}`)) {
            this.routeIdsSelected.delete(`${agencyId}/${routeId}`);
        } else {
            this.routeIdsSelected.add(`${agencyId}/${routeId}`);
        }
    }

    onStopClick(agencyId: string, stopId: string) {
        const uniqueStopId = `${agencyId}/${stopId}`;
        if (this.stopIdSelected === uniqueStopId) {
            this.stopIdSelected = '';
            this.clearStopId.emit();
        } else {
            this.stopIdSelected = uniqueStopId;
            this.newStopId.emit({ agencyId, stopId });
        }
    }

    private async setStops(agencyIds: string[]) {
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

    private async setRouteStops(routeIds: RouteId[]) {
        this.routeStops = this.routeStops.concat(await Promise.all(
            routeIds
                .filter((routeId) =>
                    !this.knownRouteIds.has(`${routeId.agencyId}/${routeId.routeId}`)
                ).sort((a, b) =>
                    (`${a.agencyId}${a.routeId}`).localeCompare(`${b.agencyId}${b.routeId}`)
                ).map(async (routeId) => {
                    this.knownRouteIds.add(`${routeId.agencyId}/${routeId.routeId}`);
                    const route = await this.staticDataService.getRouteById(routeId.agencyId, routeId.routeId) as RouteDto;
                    const stops = (await this.staticDataService.getStopByIds(routeId.agencyId, route.stop_ids))
                        .map((stop) => {
                            return {
                                ...stop,
                                route_ids: stop.route_ids.filter((value) => value != routeId.routeId),
                            }
                        });
                    return { route, stops };
                })
        ));

        console.log(this.routeStops);
    }
}

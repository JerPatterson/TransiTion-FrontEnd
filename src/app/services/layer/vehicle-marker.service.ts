import { Injectable } from '@angular/core';
import L from 'leaflet';
import 'leaflet.markercluster';
import { RealtimeDataService } from 'src/app/services/realtime/realtime-data.service';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { StaticDataService } from 'src/app/services/static/static-data.service';
import { RouteType } from '@app/utils/enums';
import { AGENCY_TO_STYLE } from '@app/utils/styles';
import { 
    BASE_NUMBER_HEXADECIMAL,
    DEFAULT_ANCHOR_SHIFT,
    DEFAULT_BACKGROUND_COLOR,
    DEFAULT_CLUSTER_ICON_SIZE,
    DEFAULT_ICON_COLOR,
    DEFAULT_ICON_SIZE,
    DISABLE_CLUSTER_ZOOM,
    FIRST_CLUSTER_ALPHA,
    FIRST_CLUSTER_MAX_CHILD_COUNT,
    FOURTH_CLUSTER_ALPHA,
    MAX_ZOOM,
    OLD_VEHICLE_BACKGROUND_COLOR,
    OLD_VEHICLE_COLOR,
    ONE_MINUTE_IN_SEC,
    ONE_SEC_IN_MS,
    PARAM_SEPARATOR,
    SECOND_CLUSTER_ALPHA,
    SECOND_CLUSTER_MAX_CHILD_COUNT,
    THIRD_CLUSTER_ALPHA,
    THIRD_CLUSTER_MAX_CHILD_COUNT
} from '@app/utils/constants';

@Injectable({
    providedIn: 'root'
})
export class VehicleMarkerService {
    constructor(
        private stDataService: StaticDataService,
        private rtDataService: RealtimeDataService,
    ) {}

    async createVehiclesLayer(
        agencyIds: string[],
        clusteringAtMaxZoom: boolean,
        showOldVehicles: boolean,
        emitVehicleSelected: (a: string, v: GtfsRealtimeBindings.transit_realtime.IVehiclePosition) => void,
    ) : Promise<L.MarkerClusterGroup> {
        const clusterGroup = await this.buildVehicleMarkerClusterGroup(
            agencyIds.length === 1 ? 
                this.getBackgroundColor(agencyIds[0]) : DEFAULT_BACKGROUND_COLOR, 
            clusteringAtMaxZoom,
        );
        
        agencyIds.map(async (agencyId) => {
            (await this.rtDataService.getVehiclesFromAgency(agencyId)).forEach(async vehicle => {
                if (!showOldVehicles && this.wasSeenLongAgo(vehicle.timestamp as number)) return;
                const vehicleMarker = await this.buildVehicleMarker(agencyId, vehicle, emitVehicleSelected);
                if (vehicleMarker) clusterGroup.addLayer(vehicleMarker);
            });
        });

        return clusterGroup;
    }

    async createVehiclesLayerFromRoutes(
        routes: string[], 
        clusteringAtMaxZoom: boolean,
        showOldVehicles: boolean,
        emitVehicleSelected: (a: string, v: GtfsRealtimeBindings.transit_realtime.IVehiclePosition) => void,
    ) : Promise<L.MarkerClusterGroup> {
        const firstRouteAgencyId = routes[0].split(PARAM_SEPARATOR)[0];
        const lastRouteAgencyId = routes[routes.length - 1].split(PARAM_SEPARATOR)[0];
        const clusterGroup = await this.buildVehicleMarkerClusterGroup(
            firstRouteAgencyId === lastRouteAgencyId ? 
                this.getBackgroundColor(firstRouteAgencyId) : DEFAULT_BACKGROUND_COLOR, 
            clusteringAtMaxZoom,
        );

        routes.forEach(async (route) => {
            const agencyId = route.split(PARAM_SEPARATOR)[0];
            const routeId = route.split(PARAM_SEPARATOR)[1];
            (await this.rtDataService.getVehiclesFromRoute(agencyId, routeId)).forEach(async vehicle => {
                if (!showOldVehicles && this.wasSeenLongAgo(vehicle.timestamp as number)) return;
                const vehicleMarker = await this.buildVehicleMarker(agencyId, vehicle, emitVehicleSelected);
                if (vehicleMarker) clusterGroup.addLayer(vehicleMarker);
            });
        })

        return clusterGroup;
    }


    private async buildVehicleMarkerClusterGroup(
        color: string, 
        clusteringAtMaxZoom: boolean
    ): Promise<L.MarkerClusterGroup> {
        return L.markerClusterGroup({
            chunkedLoading: true,
            disableClusteringAtZoom: clusteringAtMaxZoom ? MAX_ZOOM + 1 : DISABLE_CLUSTER_ZOOM,
            iconCreateFunction: (cluster) => {
                const childCount = cluster.getChildCount();
                const alpha = this.getOpacityFromChildCount(childCount);
                return new L.DivIcon({
                    className: 'marker-cluster',
                    html: `
                        <div style="
                            border: solid 2px ${color};
                            background-color:${color + alpha};">
                            ${childCount}
                        </div>`,
                    iconSize: new L.Point(DEFAULT_CLUSTER_ICON_SIZE, DEFAULT_CLUSTER_ICON_SIZE),
                });
            },
        });
    }

    private async buildVehicleMarker(
        agencyId: string,
        vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition,
        emitMarkerClicked: (
            agencyId: string,
            vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition
        ) => void,
    ) : Promise<L.Marker | undefined> {
        if (!vehicle.position) return;
        const marker = L.marker(
                [vehicle.position.latitude, vehicle.position.longitude], 
                { icon: await this.buildVehicleIcon(
                        agencyId,
                        vehicle.trip?.routeId,
                        vehicle.position.bearing,
                        vehicle.timestamp as number
                    ),
                },
            ).addEventListener(
                'click', 
                () => emitMarkerClicked(agencyId, vehicle)
            );
    
        return marker;
    }

    private async buildVehicleIcon(
        agencyId: string,
        routeId?: string | null,
        bearing?: number | null,
        timestamp?: number | null,
    ): Promise<L.DivIcon> {
        const wasSeenLongAgo = this.wasSeenLongAgo(timestamp);
        const route = routeId ? await this.stDataService.getRouteById(agencyId, routeId) : undefined;
        const iconLink = this.getIconLinkFromRouteType(route?.route_type);
        const vehicleIconColor = this.getIconColor(agencyId);
        const backgroundColor = this.getBackgroundColor(agencyId);

        return L.divIcon({
            className: 'vehicle-icon',
            html: `
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 70 70"
                    style="color: ${wasSeenLongAgo ? OLD_VEHICLE_COLOR : vehicleIconColor};">
                    <g
                        fill="${wasSeenLongAgo ? OLD_VEHICLE_BACKGROUND_COLOR : backgroundColor}"
                        transform="rotate(${bearing ? bearing - 180 : 0} 35 35)">
                        <defs>
                            <filter id="blur">
                                <feDropShadow dx="0" dy="0" stdDeviation="3.0"
                                    flood-color="black"/>
                            </filter>
                            <mask id="circle-mask" x="-0.2" y="-0.2" width="1.4" height="1.4">
                                <circle cx="35" cy="35" r="25" fill="white"/>  
                                <circle cx="35" cy="35" r="20" fill="black"/>  
                            </mask>
                        </defs>
                        <circle cx="35" cy="35" r="20" style="mask: url(#circle-mask); filter: url(#blur)"/>
                        <circle cx="35" cy="35" r="20"/>
                        <polygon points="35,70 20,53 35,60 50,53"/>
                    </g>
                        <use height="32" x="0" y="17" xlink:href="${iconLink}" href="${iconLink}"></use>
                </svg>`,
            iconSize: [DEFAULT_ICON_SIZE, DEFAULT_ICON_SIZE],
            iconAnchor: [DEFAULT_ANCHOR_SHIFT, DEFAULT_ANCHOR_SHIFT],
        });     
    }


    private wasSeenLongAgo(timestamp?: number | null): boolean {
        if (!timestamp) return true;
        return (Date.now() / ONE_SEC_IN_MS - timestamp) > 3 * ONE_MINUTE_IN_SEC;
    }

    private getIconColor(agencyId: string): string {
        const color = AGENCY_TO_STYLE.get(agencyId.toLowerCase())?.vehicleIconColor;
        return color ? color : DEFAULT_ICON_COLOR;
    }

    private getBackgroundColor(agencyId: string): string {
        const color = AGENCY_TO_STYLE.get(agencyId.toLowerCase())?.backgroundColor;
        return color ? color : DEFAULT_BACKGROUND_COLOR;
    }

    private getIconLinkFromRouteType(type?: RouteType | null): string {
        switch(type) {
            case RouteType.Subway:
                return './assets/icons/subway.svg#subway';
            case RouteType.Rail:
                return './assets/icons/train.svg#train';
            default:
                return './assets/icons/bus.svg#bus';
        }
    }

    private getOpacityFromChildCount(count: number): string {
        let alpha = FOURTH_CLUSTER_ALPHA;
        if (count <= FIRST_CLUSTER_MAX_CHILD_COUNT)
            alpha = FIRST_CLUSTER_ALPHA;
        else if (count <= SECOND_CLUSTER_MAX_CHILD_COUNT)
            alpha = SECOND_CLUSTER_ALPHA;
        else if (count < THIRD_CLUSTER_MAX_CHILD_COUNT)
            alpha = THIRD_CLUSTER_ALPHA;
        
        return alpha.toString(BASE_NUMBER_HEXADECIMAL);
    }
}

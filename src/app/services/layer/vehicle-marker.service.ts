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
    DEFAULT_COLOR,
    DISABLE_CLUSTER_ZOOM,
    FIRST_CLUSTER_ALPHA,
    FIRST_CLUSTER_MAX_CHILD_COUT,
    FOURTH_CLUSTER_ALPHA,
    MAX_ZOOM,
    SECOND_CLUSTER_ALPHA,
    SECOND_CLUSTER_MAX_CHILD_COUT,
    THIRD_CLUSTER_ALPHA,
    THIRD_CLUSTER_MAX_CHILD_COUT
} from '@app/utils/constants';

@Injectable({
    providedIn: 'root'
})
export class VehicleMarkerService {
    constructor(
        private rtDataService: RealtimeDataService,
        private stDataService: StaticDataService,
    ) {}

    async createVehiclesLayer(
        agencyIds: string[],
        clusteringMaxZoom: boolean,
        emitVehicleSelected: (a: string, v: GtfsRealtimeBindings.transit_realtime.IVehiclePosition) => void,
    ) : Promise<L.MarkerClusterGroup> {
        let color: string | undefined;
        if (agencyIds.length === 1)
            color = AGENCY_TO_STYLE.get(agencyIds[0].toLowerCase())?.backgroundColor;
        const clusterGroup = await this.buildVehicleMarkerClusterGroup(
            color ? color : DEFAULT_COLOR, clusteringMaxZoom
        );
        
        agencyIds.map(async (agencyId) => {
            (await this.rtDataService.getVehiclesFromAgency(agencyId)).forEach(async vehicle => {
                const vehicleMarker = await this.buildVehicleMarker(agencyId, vehicle, emitVehicleSelected);
                if (vehicleMarker) clusterGroup.addLayer(vehicleMarker);
            });
        });

        return clusterGroup;
    }

    async createVehiclesLayerFromRoute(
        agencyId: string,
        routeId: string, 
        clusteringMaxZoom: boolean,
        emitVehicleSelected: (a: string, v: GtfsRealtimeBindings.transit_realtime.IVehiclePosition) => void,
    ) : Promise<L.MarkerClusterGroup> {
        const vehicleMarkers = await this.buildVehicleMarkerClusterGroup(agencyId, clusteringMaxZoom);
        (await this.rtDataService.getVehiclesFromRoute(agencyId, routeId)).forEach(async vehicle => {
            const vehicleMarker = await this.buildVehicleMarker(agencyId, vehicle, emitVehicleSelected);
            if (vehicleMarker) vehicleMarkers.addLayer(vehicleMarker);
        });

        return vehicleMarkers;
    }

    private async buildVehicleMarkerClusterGroup(color: string, clusteringMaxZoom: boolean)
        : Promise<L.MarkerClusterGroup> {
        return L.markerClusterGroup({
            chunkedLoading: true,
            disableClusteringAtZoom: clusteringMaxZoom ? DISABLE_CLUSTER_ZOOM : MAX_ZOOM + 1,
            iconCreateFunction: (cluster) => {
                let alpha = FOURTH_CLUSTER_ALPHA;
                const childCount = cluster.getChildCount();
                if (childCount <= FIRST_CLUSTER_MAX_CHILD_COUT)
                    alpha = FIRST_CLUSTER_ALPHA;
                else if (childCount <= SECOND_CLUSTER_MAX_CHILD_COUT)
                    alpha = SECOND_CLUSTER_ALPHA;
                else if (childCount < THIRD_CLUSTER_MAX_CHILD_COUT)
                    alpha = THIRD_CLUSTER_ALPHA;
            
                return new L.DivIcon({
                    html: `
                        <div style="
                            border: solid 2px ${color};
                            background-color:${color + (alpha).toString(BASE_NUMBER_HEXADECIMAL)};">
                            ${childCount}
                        </div>`, 
                    className: 'marker-cluster',
                    iconSize: new L.Point(40, 40),
                });
            },
        });
    }

    private async buildVehicleMarker(
            agencyId: string,
            vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition,
            emitVehicleSelected: (a: string, v: GtfsRealtimeBindings.transit_realtime.IVehiclePosition) => void,
        ) : Promise<L.Marker | undefined> {
        if (!vehicle.position) return;
        const marker = L.marker([vehicle.position.latitude, vehicle.position.longitude], {
            icon: await this.buildVehicleIcon(agencyId, vehicle.trip?.routeId),
        });
        return marker.addEventListener('click', () => emitVehicleSelected(agencyId, vehicle));
    }

    private async buildVehicleIcon(agencyId: string, routeId?: string | null): Promise<L.DivIcon> {
        const route = routeId ? await this.stDataService.getRouteById(agencyId, routeId) : undefined;
        const iconLink = this.getIconLinkFromRouteType(route?.route_type);
        const backgroundColor = AGENCY_TO_STYLE.get(agencyId.toLowerCase())?.backgroundColor;
        const vehicleIconColor = AGENCY_TO_STYLE.get(agencyId.toLowerCase())?.vehicleIconColor;

        return L.divIcon({
            className: 'vehicle-icon',
            html: `
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 50 50"
                    style="color: ${vehicleIconColor}">
                    <defs>
                        <filter id="blur">
                            <feDropShadow dx="0" dy="0" stdDeviation="3.0"
                                flood-color="black"/>
                        </filter>
                        <mask id="circle-mask" x="-0.2" y="-0.2" width="1.4" height="1.4">
                            <circle cx="25" cy="25" r="25" fill="white"/>  
                            <circle cx="25" cy="25" r="20" fill="black"/>  
                        </mask>
                    </defs>
                    <circle cx="25" cy="25" r="20" style="mask: url(#circle-mask); filter: url(#blur)"/>
                    <circle cx="25" cy="25" r="20" fill="${backgroundColor ? backgroundColor : '#ffffff'}"/>
                    <use
                        height="32" y="7"
                        xlink:href="${iconLink}"
                        href="${iconLink}"></use>
                </svg>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [0, -25],
          });     
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
}

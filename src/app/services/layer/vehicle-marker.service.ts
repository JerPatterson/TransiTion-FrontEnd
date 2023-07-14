import { Injectable } from '@angular/core';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-markers-canvas';
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

        const markersCanvas = new L.MarkersCanvas();
        agencyIds.map(async (agencyId) => {
            (await this.rtDataService.getVehiclesFromAgency(agencyId)).forEach(async vehicle => {
                if (!showOldVehicles && this.wasSeenLongAgo(vehicle.timestamp as number)) return;
                const vehicleMarker = await this.buildVehicleMarker(agencyId, vehicle, emitVehicleSelected);
                if (vehicleMarker) markersCanvas.addMarker(vehicleMarker);
            });
        });
        markersCanvas.addTo(clusterGroup);
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

        // return L.icon({
        //     iconUrl: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 70 70" style="color: ${wasSeenLongAgo ? OLD_VEHICLE_COLOR : vehicleIconColor};"><g fill="${wasSeenLongAgo ? OLD_VEHICLE_BACKGROUND_COLOR : backgroundColor}" transform="rotate(${bearing ? bearing - 180 : 0} 35 35)"><defs><filter id="blur"><feDropShadow dx="0" dy="0" stdDeviation="3.0" flood-color="black"/></filter><mask id="circle-mask" x="-0.2" y="-0.2" width="1.4" height="1.4"><circle cx="35" cy="35" r="25" fill="white"/><circle cx="35" cy="35" r="20" fill="black"/></mask></defs><circle cx="35" cy="35" r="20" style="mask: url(%23circle-mask); filter: url(%23blur)"/><circle cx="35" cy="35" r="20"/><polygon points="35,70 20,53 35,60 50,53"/></g><use height="32" x="0" y="17" xlink:href="${iconLink}" href="${iconLink}"></use></svg>`,
        //     iconSize: [DEFAULT_ICON_SIZE, DEFAULT_ICON_SIZE],
        //     iconAnchor: [DEFAULT_ANCHOR_SHIFT, DEFAULT_ANCHOR_SHIFT],
        // });
        return L.divIcon({
            className: 'vehicle-icon',
            // iconUrl: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 70 70" style="color: ${wasSeenLongAgo ? OLD_VEHICLE_COLOR : vehicleIconColor};"><g fill="${wasSeenLongAgo ? OLD_VEHICLE_BACKGROUND_COLOR : backgroundColor}" transform="rotate(${bearing ? bearing - 180 : 0} 35 35)"><defs><filter id="blur"><feDropShadow dx="0" dy="0" stdDeviation="3.0" flood-color="black"/></filter><mask id="circle-mask" x="-0.2" y="-0.2" width="1.4" height="1.4"><circle cx="35" cy="35" r="25" fill="white"/><circle cx="35" cy="35" r="20" fill="black"/></mask></defs><circle cx="35" cy="35" r="20" style="mask: url(%23circle-mask); filter: url(%23blur)"/><circle cx="35" cy="35" r="20"/><polygon points="35,70 20,53 35,60 50,53"/></g><use height="32" x="0" y="17" xlink:href="${iconLink}" href="${iconLink}"></use></svg>`,
            iconUrl: `data:image/svg+xml,
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
                        <circle cx="35" cy="35" r="20" style="mask: url(%23circle-mask); filter: url(%23blur)"/>
                        <circle cx="35" cy="35" r="20"/>
                        <polygon points="35,70 20,53 35,60 50,53"/>
                    </g>
                    ${iconLink}
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
                return './assets/icons/subway.svg%23subway';
            case RouteType.Rail:
                return './assets/icons/train.svg%23train';
            default:
                return `
                <svg
                    y="17"
                    height="32"
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1024.000000 1024.000000"
                    preserveAspectRatio="xMidYMid meet">
                    <g
                        stroke="none"
                        fill="currentColor"
                        transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)">
                        <path d="M4820 9424 c-307 -28 -408 -39 -587 -65 -528 -76 -1079 -204 -1382
                            -320 -146 -57 -390 -177 -481 -238 -97 -64 -196 -155 -256 -234 -60 -79 -127
                            -220 -153 -322 -11 -44 -97 -670 -191 -1391 l-170 -1310 0 -1822 0 -1822 295
                            0 295 0 0 -322 c0 -253 4 -337 15 -387 53 -224 247 -371 490 -371 226 0 400
                            119 477 326 21 56 22 78 26 407 l3 347 1915 0 1914 0 0 -313 c0 -344 6 -399
                            52 -497 80 -168 251 -270 453 -270 243 0 437 147 490 371 11 50 15 134 15 387
                            l0 322 295 0 295 0 0 1820 0 1821 -170 1312 c-94 722 -180 1348 -191 1392 -41
                            164 -140 329 -265 443 -363 334 -1225 594 -2376 718 -136 15 -704 27 -808 18z
                            m1862 -689 c146 -101 109 -338 -61 -385 -50 -14 -2962 -14 -3012 0 -157 44
                            -206 256 -86 368 57 54 -15 51 1609 49 l1506 -2 44 -30z m835 -851 c107 -44
                            173 -127 208 -259 8 -33 78 -513 156 -1069 107 -770 139 -1022 134 -1060 -16
                            -117 -79 -200 -173 -227 -39 -12 -489 -14 -2727 -14 -3000 0 -2744 -7 -2825
                            74 -47 48 -64 87 -75 176 -8 64 265 2034 296 2140 32 109 85 181 166 224 78
                            41 11 40 2458 38 l2330 -2 52 -21z m-4686 -3890 c392 -115 474 -643 134 -869
                            -89 -59 -155 -78 -270 -78 -113 0 -179 19 -273 80 -292 193 -278 641 26 819
                            106 63 265 82 383 48z m4881 -13 c146 -57 264 -196 297 -349 51 -242 -81 -478
                            -317 -564 -84 -31 -235 -30 -317 2 -202 78 -325 252 -325 460 0 209 137 395
                            340 462 78 26 242 20 322 -11z"
                        />
                    </g>
                </svg>`;
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

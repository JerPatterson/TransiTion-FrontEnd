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
    DEFAULT_BACKGROUND_COLOR,
    DEFAULT_ICON_COLOR,
    DEFAULT_SHAPE_COLOR,
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
    THIRD_CLUSTER_MAX_CHILD_COUNT,
    VEHICLE_ANCHOR_SHIFT,
    VEHICLE_CLUSTER_ICON_SIZE,
    VEHICLE_ICON_SIZE,
} from '@app/utils/constants';
import { MapRenderingOptions, VehicleId } from '@app/utils/component-interface';

@Injectable({
    providedIn: 'root'
})
export class VehicleMarkerService {
    private layerGroup = new L.LayerGroup();

    private layerIdsByAgencyId = new Map<string, number[]>();

    private markersCanvas = new L.MarkersCanvas();

    constructor(
        private stDataService: StaticDataService,
        private rtDataService: RealtimeDataService,
    ) {}

    get vehicleLayer() {
        return this.layerGroup;
    }

    async updateLayerFromAgencies(
        agencyIds: string[],
        options: MapRenderingOptions,
        clickHandler: (v: VehicleId, rId: string, tId: string) => void,
    ): Promise<void> {
        this.clearLayerGroup();
        await this.addAgencies(agencyIds, options, clickHandler);
    }

    async addAgencies(
        agencyIds: string[],
        options: MapRenderingOptions,
        clickHandler: (v: VehicleId, rId: string, tId: string) => void,
    ): Promise<void> {
        if (options.mergeAllVehicleClusters) {
            this.layerGroup.addLayer(
                await this.buildLayerFromAgencies(agencyIds, options, clickHandler));
        } else {
            agencyIds.forEach(async (agencyId) => {
                const layer = await this.buildLayerFromAgencies([agencyId], options, clickHandler);
                this.layerGroup.addLayer(layer);
                this.addLayerIdToAgency(agencyId, this.layerGroup.getLayerId(layer));
            });
        }
    }

    removeAgencies(agencyIds: string[]): void {
        agencyIds.forEach((agencyId) => {
            this.layerIdsByAgencyId.get(agencyId)?.forEach((layerId) => 
                this.layerGroup.removeLayer(layerId));
            this.layerIdsByAgencyId.delete(agencyId);
        });
    }

    async updateLayerFromRoutes(
        routeIds: string[],
        options: MapRenderingOptions,
        clickHandler: (v: VehicleId, rId: string, tId: string) => void,
    ): Promise<void> {
        this.clearLayerGroup();
        if (!routeIds.length) return;
        const routeIdsSorted = routeIds.sort((a, b) => a.localeCompare(b));

        if (options.mergeAllVehicleClusters) {
            this.layerGroup.addLayer(await this.buildLayerFromRoutes(routeIdsSorted, options, clickHandler));
        } else {
            let routeIdsFromAgency: string[] = [];
            let currentAgencyId = routeIdsSorted[0].split(PARAM_SEPARATOR)[0];
            for (let routeId of routeIdsSorted.concat([PARAM_SEPARATOR])) {
                const agencyId = routeId.split(PARAM_SEPARATOR)[0];
                if (agencyId !== currentAgencyId) {
                    const layer = await this.buildLayerFromRoutes(routeIdsFromAgency, options, clickHandler);
                    this.layerGroup.addLayer(layer);
                    const layerId = this.layerGroup.getLayerId(layer);
                    this.addLayerIdToAgency(agencyId, layerId);
                    currentAgencyId = agencyId;
                    routeIdsFromAgency = [];
                }
                routeIdsFromAgency.push(routeId);
            }
        }
    }

    async updateLayerFromTrips(
        agencyId: string,
        tripIds: string[],
        options: MapRenderingOptions,
        clickHandler: (v: VehicleId, rId: string, tId: string) => void,
    ): Promise<void> {
        this.clearLayerGroup();
        const layer = await this.buildLayerFromTrips(agencyId, tripIds, options, clickHandler);
        this.layerGroup.addLayer(layer);
        this.addLayerIdToAgency(agencyId, this.layerGroup.getLayerId(layer)); 
    }


    private clearLayerGroup(): void {
        this.layerGroup.clearLayers();
        this.layerIdsByAgencyId.clear();
    }

    private addLayerIdToAgency(agencyId: string, layerId: number): void {
        let layerIds = this.layerIdsByAgencyId.get(agencyId);
        layerIds ? layerIds.push(layerId) : this.layerIdsByAgencyId.set(agencyId, [layerId]);
    }


    private async buildLayerFromAgencies(
        agencyIds: string[],
        options: MapRenderingOptions,
        clickHandler: (v: VehicleId, rId: string, tId: string) => void,
    ) : Promise<L.LayerGroup> {
        let layerGroup: L.LayerGroup;
        if (options.useVehicleClusters) {
            layerGroup = await this.buildMarkerClusterGroup(
                agencyIds.length === 1 ? 
                    this.getBackgroundColor(agencyIds[0]) : DEFAULT_BACKGROUND_COLOR, 
                options.mergeAllVehicleClusters,
            );

            agencyIds.map(async (agencyId) => {
                (await this.rtDataService.getVehiclesFromAgency(agencyId)).forEach(async vehicle => {
                    if (!options.showOldVehicles && this.wasSeenLongAgo(vehicle.timestamp as number)) return;
                    const vehicleMarker = await this.buildMarkerCluster(agencyId, vehicle, clickHandler);
                    if (vehicleMarker) layerGroup.addLayer(vehicleMarker);
                });
            });
        } else {
            agencyIds.map(async (agencyId) => {
                (await this.rtDataService.getVehiclesFromAgency(agencyId)).forEach(async vehicle => {
                    if (!options.showOldVehicles && this.wasSeenLongAgo(vehicle.timestamp as number)) return;
                    const vehicleMarker = await this.buildMarkerCanvas(agencyId, vehicle, clickHandler);
                    if (vehicleMarker) this.markersCanvas.addMarker(vehicleMarker);
                });
            });
            layerGroup = L.layerGroup([this.markersCanvas], { pane: 'marker' })
                .on('remove', () => this.markersCanvas.clear());
        }

        return layerGroup;
    }

    private async buildLayerFromRoutes(
        routes: string[], 
        options: MapRenderingOptions,
        clickHandler: (v: VehicleId, tId: string, c: string) => void,
    ) : Promise<L.LayerGroup> {
        let layerGroup: L.LayerGroup;
        const firstRouteAgencyId = routes[0].split(PARAM_SEPARATOR)[0];
        const lastRouteAgencyId = routes[routes.length - 1].split(PARAM_SEPARATOR)[0];
        if (options.useVehicleClusters) {
            layerGroup = await this.buildMarkerClusterGroup(
                firstRouteAgencyId === lastRouteAgencyId ? 
                    this.getBackgroundColor(firstRouteAgencyId) : DEFAULT_BACKGROUND_COLOR, 
                options.mergeAllVehicleClusters,
            );

            routes.forEach(async (route) => {
                const agencyId = route.split(PARAM_SEPARATOR)[0];
                const routeId = route.split(PARAM_SEPARATOR)[1];
                (await this.rtDataService.getVehiclesFromRoute(agencyId, routeId)).forEach(async vehicle => {
                    if (!options.showOldVehicles && this.wasSeenLongAgo(vehicle.timestamp as number)) return;
                    const vehicleMarker = await this.buildMarkerCluster(agencyId, vehicle, clickHandler);
                    if (vehicleMarker) layerGroup.addLayer(vehicleMarker);
                });
            });
        } else {
            routes.forEach(async (route) => {
                const agencyId = route.split(PARAM_SEPARATOR)[0];
                const routeId = route.split(PARAM_SEPARATOR)[1];
                (await this.rtDataService.getVehiclesFromRoute(agencyId, routeId)).forEach(async vehicle => {
                    if (!options.showOldVehicles && this.wasSeenLongAgo(vehicle.timestamp as number)) return;
                    const vehicleMarker = await this.buildMarkerCanvas(agencyId, vehicle, clickHandler);
                    if (!vehicleMarker) return;
                    this.markersCanvas.addMarker(vehicleMarker);
                    this.addLayerIdToAgency(agencyId, layerGroup.getLayerId(vehicleMarker));
                });
            });
            layerGroup = L.layerGroup([this.markersCanvas], { pane: 'marker' })
                .on('remove', () => this.markersCanvas.clear());
        }

        return layerGroup;
    }

    private async buildLayerFromTrips(
        agencyId: string,
        tripIds: string[], 
        options: MapRenderingOptions,
        clickHandler: (v: VehicleId, tId: string, c: string) => void,
    ) : Promise<L.LayerGroup> {
        let layerGroup: L.LayerGroup;
        if (options.useVehicleClusters) {
            layerGroup = await this.buildMarkerClusterGroup(
                this.getBackgroundColor(agencyId), 
                options.mergeAllVehicleClusters,
            );

            (await this.rtDataService.getVehiclesFromTripIds(agencyId, tripIds)).forEach(async vehicle => {
                if (!options.showOldVehicles && this.wasSeenLongAgo(vehicle.timestamp as number)) return;
                const vehicleMarker = await this.buildMarkerCluster(agencyId, vehicle, clickHandler);
                if (!vehicleMarker) return;
                layerGroup.addLayer(vehicleMarker);
                this.addLayerIdToAgency(agencyId, layerGroup.getLayerId(vehicleMarker));
            });
        } else {
            (await this.rtDataService.getVehiclesFromTripIds(agencyId, tripIds)).forEach(async vehicle => {
                if (!options.showOldVehicles && this.wasSeenLongAgo(vehicle.timestamp as number)) return;
                const vehicleMarker = await this.buildMarkerCanvas(agencyId, vehicle, clickHandler);
                if (vehicleMarker) this.markersCanvas.addMarker(vehicleMarker);
            });
            layerGroup = L.layerGroup([this.markersCanvas], { pane: 'marker' })
                .on('remove', () => this.markersCanvas.clear());
        }

        return layerGroup;
    }


    private async buildMarkerClusterGroup(
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
                    iconSize: new L.Point(VEHICLE_CLUSTER_ICON_SIZE, VEHICLE_CLUSTER_ICON_SIZE),
                });
            },
        });
    }

    private async buildMarkerCluster(
        agencyId: string,
        vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition,
        emitMarkerClicked: (v: VehicleId, rId: string, tId: string) => void,
    ) : Promise<L.Marker | undefined> {
        if (!vehicle.position) return;
        return L.marker(
                [vehicle.position.latitude, vehicle.position.longitude], 
                { 
                    icon: await this.buildIconCluster(
                        agencyId,
                        vehicle.trip?.routeId,
                        vehicle.position.bearing,
                        vehicle.timestamp as number
                    ),
                },
            ).addEventListener(
                'click', 
                async () => emitMarkerClicked(
                    { agencyId, vehicleId: vehicle.vehicle?.id as string },
                    vehicle.trip?.tripId as string,
                    await this.getRouteColor(agencyId, vehicle.trip?.routeId),
                ),
            );
    }

    private async buildIconCluster(
        agencyId: string,
        routeId?: string | null,
        bearing?: number | null,
        timestamp?: number | null,
    ): Promise<L.DivIcon> {
        const vehicleIconColor = this.getIconColor(agencyId);
        const backgroundColor = this.getBackgroundColor(agencyId);
        const wasSeenLongAgo = this.wasSeenLongAgo(timestamp);
        const route = routeId ? await this.stDataService.getRouteById(agencyId, routeId) : undefined;

        return L.divIcon({
            className: 'vehicle-icon',
            html: (bearing ? 
                this.getHtmlWithBearing(
                    bearing,
                    this.getIconLinkFromRouteType(route?.route_type),
                    wasSeenLongAgo ? OLD_VEHICLE_COLOR : vehicleIconColor, 
                    wasSeenLongAgo ? OLD_VEHICLE_BACKGROUND_COLOR : backgroundColor,
                ) 
                : this.getHtmlWithoutBearing(
                    this.getIconLinkFromRouteType(route?.route_type),
                    wasSeenLongAgo ? OLD_VEHICLE_COLOR : vehicleIconColor, 
                    wasSeenLongAgo ? OLD_VEHICLE_BACKGROUND_COLOR : backgroundColor,
                )
            ),
            iconSize: [VEHICLE_ICON_SIZE, VEHICLE_ICON_SIZE],
            iconAnchor: [VEHICLE_ANCHOR_SHIFT, VEHICLE_ANCHOR_SHIFT],
        });
    }


    private async buildMarkerCanvas(
        agencyId: string,
        vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition,
        emitMarkerClicked: (v: VehicleId, rId: string, tId: string) => void,
    ) : Promise<L.Marker | undefined> {
        if (!vehicle.position) return;
        const marker = L.marker(
                [vehicle.position.latitude, vehicle.position.longitude], 
                { 
                    icon: await this.buildIconCanvas(
                        agencyId,
                        vehicle.trip?.routeId,
                        vehicle.position.bearing,
                        vehicle.timestamp as number
                    ),
                },
            ).addEventListener(
                'click', 
                async () => emitMarkerClicked(
                    { agencyId, vehicleId: vehicle.vehicle?.id as string },
                    vehicle.trip?.tripId as string,
                    await this.getRouteColor(agencyId, vehicle.trip?.routeId),
                ),
            );
    
        return marker;
    }

    private async buildIconCanvas(
        agencyId: string,
        routeId?: string | null,
        bearing?: number | null,
        timestamp?: number | null,
    ): Promise<L.DivIcon> {
        const iconColor = this.getIconColor(agencyId);
        const backgroundColor = this.getBackgroundColor(agencyId);
        const wasSeenLongAgo = this.wasSeenLongAgo(timestamp);
        const route = routeId ? await this.stDataService.getRouteById(agencyId, routeId) : undefined;
        const iconSVG = await this.getIconSVGFromRouteType(iconColor, route?.route_type);

        return L.icon({
            iconUrl: bearing ? 
                this.getIconUrlWithBearing(
                    bearing,
                    iconSVG,
                    wasSeenLongAgo ? OLD_VEHICLE_BACKGROUND_COLOR : backgroundColor,
                )
                : this.getIconUrlWithoutBearing(
                    iconSVG,
                    wasSeenLongAgo ? OLD_VEHICLE_BACKGROUND_COLOR : backgroundColor,
                ),
            iconSize: [VEHICLE_ICON_SIZE, VEHICLE_ICON_SIZE],
            iconAnchor: [VEHICLE_ANCHOR_SHIFT, VEHICLE_ANCHOR_SHIFT],
        });
    }


    private async getRouteColor(agencyId: string, routeId?: string | null) {
        if (!routeId) return DEFAULT_SHAPE_COLOR;
        const route = await this.stDataService.getRouteById(agencyId, routeId);

        return route?.route_color ? `#${route.route_color}` : DEFAULT_SHAPE_COLOR;
    }

    private wasSeenLongAgo(timestamp?: number | null): boolean {
        if (!timestamp) return true;
        return (Date.now() / ONE_SEC_IN_MS - timestamp) > 3 * ONE_MINUTE_IN_SEC;
    }

    private getIconColor(agencyId: string): string {
        const color = AGENCY_TO_STYLE.get(agencyId.toLowerCase())?.iconColor;
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


    private getHtmlWithBearing(
        bearing: number,
        iconLink: string,
        iconColor: string,
        backgroundColor: string,
    ): string  {
        return `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 80 80"
                style="color: ${iconColor};">
                <g
                    fill="${backgroundColor}"
                    transform="rotate(${bearing - 180} 40 40)">
                    <defs>
                        <filter id="blur">
                            <feDropShadow dx="0" dy="0" stdDeviation="3.0"
                                flood-color="black"/>
                        </filter>
                        <mask id="circle-mask" x="-0.2" y="-0.2" width="1.4" height="1.4">
                            <circle cx="40" cy="40" r="25" fill="white"/>  
                            <circle cx="40" cy="40" r="20" fill="black"/>  
                        </mask>
                        <mask id="arrow-mask" x="-0.2" y="-0.2" width="1.4" height="1.4">
                            <path d="M40,80 15,52 40,60 65,52z" fill="white"/>
                            <path d="M40,75 25,58 40,65 55,58z" fill="black"/> 
                        </mask>
                    </defs>
                    <circle cx="40" cy="40" r="20" style="mask: url(#circle-mask); filter: url(#blur)"/>
                    <circle cx="40" cy="40" r="20"/>
                    <path d="M40,75 25,58 40,65 55,58z" style="mask: url(#arrow-mask); filter: url(#blur)"/> 
                    <path d="M40,75 25,58 40,65 55,58z"/>
                </g>
                <use height="32" x="0" y="22" xlink:href="${iconLink}" href="${iconLink}"></use>
            </svg>
        `;
    }

    private getHtmlWithoutBearing(
        iconLink: string,
        iconColor: string,
        backgroundColor: string,
    ): string  {
        return `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 80 80"
                style="color: ${iconColor};">
                <g
                    fill="${backgroundColor}">
                    <defs>
                        <filter id="blur">
                            <feDropShadow dx="0" dy="0" stdDeviation="3.0"
                                flood-color="black"/>
                        </filter>
                        <mask id="circle-mask" x="-0.2" y="-0.2" width="1.4" height="1.4">
                            <circle cx="40" cy="40" r="25" fill="white"/>  
                            <circle cx="40" cy="40" r="20" fill="black"/>  
                        </mask>
                    </defs>
                    <circle cx="40" cy="40" r="20" style="mask: url(#circle-mask); filter: url(#blur)"/>
                    <circle cx="40" cy="40" r="20"/>
                </g>
                <use height="32" x="0" y="22" xlink:href="${iconLink}" href="${iconLink}"></use>
            </svg>
        `;
    }


    private getIconUrlWithBearing(
        bearing: number,
        iconSVG: string,
        backgroundColor: string,
    ): string  {
        return `
            data:image/svg+xml,
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 80 80">
                <g
                    fill="${backgroundColor.replace('#', '%23')}"
                    transform="rotate(${bearing - 180} 40 40)">
                    <circle cx="40" cy="40" r="20"/>
                    <path d="M40,75 25,58 40,65 55,58z"/>
                </g>
                ${iconSVG}
            </svg>
        `;
    }

    private getIconUrlWithoutBearing(
        iconSVG: string,
        backgroundColor: string,
    ): string  {
        return `
            data:image/svg+xml,
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 80 80">
                <g fill="${backgroundColor.replace('#', '%23')}">
                    <circle cx="40" cy="40" r="20"/>
                </g>
                ${iconSVG}
            </svg>
        `;
    }

    private async getIconSVGFromRouteType(
        iconColor: string,
        type?: RouteType | null,
    ): Promise<string> {
        switch(type) {
            case RouteType.Subway:
                return `
                    <svg
                        version="1.0"
                        height="32" x="0" y="22"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 512.000000 512.000000"
                        preserveAspectRatio="xMidYMid meet">
                        <g
                            stroke="none"
                            fill="${iconColor.replace('#', '%23')}"
                            transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                            <path d="M2090 4679 c-772 -55 -1276 -328 -1520 -824 -33 -66 -71 -160 -85
                                -210 -56 -195 -55 -157 -55 -1747 l0 -1468 2130 0 2130 0 -3 1513 -3 1512 -26
                                105 c-99 399 -324 687 -688 883 -238 128 -564 209 -960 237 -167 11 -751 11
                                -920 -1z m825 -849 c285 -20 460 -57 610 -129 146 -70 229 -156 283 -297 l27
                                -69 3 -825 c3 -912 4 -903 -60 -1032 -46 -92 -155 -198 -250 -243 -40 -19
                                -100 -40 -133 -46 -33 -6 -71 -13 -84 -16 -22 -4 -14 -15 92 -121 112 -113
                                117 -119 117 -160 l0 -42 -158 0 -157 0 -160 160 -160 160 -305 0 -305 0 -160
                                -160 -160 -160 -177 0 -178 0 0 42 c0 41 5 47 117 160 106 106 114 117 92 121
                                -13 3 -51 10 -84 16 -102 19 -198 72 -279 154 -83 84 -119 146 -146 253 -19
                                74 -20 113 -20 869 0 521 4 812 11 851 23 127 107 251 223 330 147 100 418
                                168 746 187 132 8 527 6 655 -3z"
                            />
                            <path d="M1500 2665 l0 -535 1065 0 1065 0 0 535 0 535 -1065 0 -1065 0 0
                                -535z"
                            />
                            <path d="M1742 1909 c-19 -6 -53 -30 -77 -53 -70 -70 -83 -155 -39 -245 67
                                -134 244 -158 342 -45 146 165 -11 404 -226 343z"
                            />
                            <path d="M3211 1894 c-132 -66 -157 -229 -51 -334 105 -106 268 -81 334 51 43
                                88 30 176 -39 244 -68 69 -156 82 -244 39z"
                            />
                        </g>
                    </svg>
                `;
            case RouteType.Rail:
                return `
                    <svg
                        version="1.0"
                        height="32" x="0" y="22"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 256.000000 256.000000"
                        preserveAspectRatio="xMidYMid meet">
                        <g
                            stroke="none"
                            fill="${iconColor.replace('#', '%23')}"
                            transform="translate(0.000000,256.000000) scale(0.100000,-0.100000)">
                            <path d="M1154 2392 c-48 -7 -72 -71 -46 -119 28 -52 120 -43 140 14 20 59
                                -30 116 -94 105z"
                            />
                            <path d="M1354 2390 c-28 -11 -54 -48 -54 -76 0 -12 9 -33 21 -48 43 -55 139
                                -21 139 50 0 29 -31 74 -50 74 -4 0 -14 2 -22 4 -7 3 -23 1 -34 -4z"
                            />
                            <path d="M839 2195 c-61 -20 -136 -87 -165 -150 l-24 -50 0 -556 c0 -622 -1
                                -611 71 -693 22 -24 61 -55 88 -67 l49 -22 -159 -238 c-87 -131 -159 -241
                                -159 -244 0 -3 42 -5 93 -5 l93 0 115 167 115 168 321 3 321 2 114 -167 115
                                -168 91 -3 c60 -2 92 1 92 8 0 6 -67 110 -148 233 -82 122 -151 227 -155 233
                                -4 7 14 22 48 39 65 31 108 80 135 153 19 50 20 79 20 591 0 599 0 603 -66
                                679 -20 24 -59 55 -88 70 l-51 27 -410 2 c-333 2 -419 -1 -456 -12z m609 -57
                                c7 -7 12 -39 12 -73 0 -34 -5 -66 -12 -73 -8 -8 -61 -12 -175 -12 -185 0 -183
                                -1 -183 86 0 81 8 84 190 84 108 0 160 -4 168 -12z m249 -234 c54 -40 64 -75
                                61 -221 -3 -115 -6 -135 -24 -160 -45 -62 -52 -63 -459 -63 -340 0 -373 2
                                -405 18 -61 32 -71 66 -68 229 l3 142 30 31 c16 17 43 35 60 40 16 5 197 8
                                402 7 359 -2 373 -3 400 -23z m-722 -858 c40 -17 75 -68 75 -109 0 -42 -26
                                -90 -59 -110 -78 -46 -178 4 -188 93 -5 55 22 104 70 125 41 18 60 18 102 1z
                                m699 0 c47 -20 76 -61 76 -108 0 -79 -49 -128 -131 -128 -33 0 -47 6 -74 33
                                -64 64 -51 157 25 199 41 22 60 22 104 4z"
                            />
                        </g>
                    </svg>
                `;
            default:
                return `
                    <svg
                        version="1.0"
                        height="32" x="0" y="22"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 1024.000000 1024.000000"
                        preserveAspectRatio="xMidYMid meet">
                        <g
                            fill="${iconColor.replace('#', '%23')}"
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
                    </svg>
                `;
        }
    }
}

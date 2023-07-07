import { Injectable } from '@angular/core';
import L from 'leaflet';
import 'leaflet.markercluster';
import { RealtimeDataService } from 'src/app/services/realtime/realtime-data.service';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { StaticDataService } from 'src/app/services/static/static-data.service';
import { RouteType } from '@app/utils/enums';
import { AGENCY_ID_TO_THEME_COLOR } from '@app/utils/agencies-style';

@Injectable({
    providedIn: 'root'
})
export class VehicleMarkerService {

    constructor(
        private stDataService: StaticDataService,
        private rtDataService: RealtimeDataService,
    ) {}

    async createVehiclesLayer(agencyId: string, routeId: string): Promise<L.MarkerClusterGroup> {
        const vehicleMarkers = await this.buildVehicleMarkerClusterGroup(agencyId);
        (await this.rtDataService.getVehiclesFromRoute(agencyId, routeId)).forEach(async vehicle => {
            const vehicleMarker = await this.buildVehicleMarker(agencyId, vehicle);
            if (vehicleMarker) vehicleMarkers.addLayer(vehicleMarker);
        });

        return vehicleMarkers;
    }

    async createAllVehiclesLayer(agencyId: string): Promise<L.MarkerClusterGroup> {
        const vehicleMarkers = await this.buildVehicleMarkerClusterGroup(agencyId);
        (await this.rtDataService.getVehiclesFromAgency(agencyId)).forEach(async vehicle => {
            const vehicleMarker = await this.buildVehicleMarker(agencyId, vehicle);
            if (vehicleMarker) vehicleMarkers.addLayer(vehicleMarker);
        });

        return vehicleMarkers;
    }

    private async buildVehicleMarkerClusterGroup(agencyId: string): Promise<L.MarkerClusterGroup> {
        const backgroundColor = AGENCY_ID_TO_THEME_COLOR.get(agencyId.toLowerCase());
        return L.markerClusterGroup({
            chunkedLoading: true,
            iconCreateFunction: (cluster) => {
                let alpha = 255;
                const childCount = cluster.getChildCount();
                if (childCount < 10)
                    alpha = 51;
                else if (childCount < 25)
                    alpha = 153;
                else if (childCount < 50)
                    alpha = 204;
            
                return new L.DivIcon({
                    html: `
                        <div style="
                            background-color:${(backgroundColor ? 
                                backgroundColor : '#ffffff') + (alpha).toString(16)};
                            border: solid 2px ${(backgroundColor ? 
                                backgroundColor : '#ffffff')};">
                            ${childCount}
                        </div>`, 
                    className: 'marker-cluster',
                    iconSize: new L.Point(40, 40),
                });
            },
        });
    }

    private async buildVehicleMarker(agencyId: string, vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition)
        : Promise<L.Marker | undefined> {
        if (!vehicle.position) return;
        const marker = L.marker([vehicle.position.latitude, vehicle.position.longitude], {
            icon: await this.buildVehicleIcon(agencyId, vehicle.trip?.routeId),
        });
        return marker.bindPopup(`${vehicle.vehicle?.id }`);
    }

    private async buildVehicleIcon(agencyId: string, routeId?: string | null): Promise<L.DivIcon> {
        const route = routeId ? await this.stDataService.getRouteById(agencyId, routeId) : undefined;
        const iconLink = this.getIconLinkFromRouteType(route?.route_type);
        const backgroundColor = AGENCY_ID_TO_THEME_COLOR.get(agencyId.toLowerCase());

        return L.divIcon({
            className: 'vehicle-icon',
            html: `
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 50 50">
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

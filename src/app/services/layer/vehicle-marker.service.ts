import { Injectable } from '@angular/core';
import L from 'leaflet';
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

    async createVehiclesLayer(agencyId: string, routeId: string): Promise<L.LayerGroup> {
        const vehicleMarkers = L.layerGroup();
        (await this.rtDataService.getVehiclesFromRoute(agencyId, routeId)).forEach(async vehicle => {
            const vehicleMarker = await this.buildVehicleMarker(agencyId, vehicle);
            if (vehicleMarker) vehicleMarkers.addLayer(vehicleMarker);
        });

        return L.layerGroup().addLayer(vehicleMarkers);
    }

    async createAllVehiclesLayer(agencyId: string): Promise<L.LayerGroup> {
        const vehicleMarkers = L.layerGroup();
        (await this.rtDataService.getVehiclesFromAgency(agencyId)).forEach(async vehicle => {
            const vehicleMarker = await this.buildVehicleMarker(agencyId, vehicle);
            if (vehicleMarker) vehicleMarkers.addLayer(vehicleMarker);
        });

        return L.layerGroup().addLayer(vehicleMarkers);
    }

    private async buildVehicleMarker(agencyId: string, vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition)
        : Promise<L.Marker | undefined> {
        if (!vehicle.position) return;
        const marker = L.marker([vehicle.position.latitude, vehicle.position.longitude], {
            icon: await this.buildVehicleIcon(agencyId, vehicle.trip?.routeId),
            // L.divIcon({
            //     iconUrl: './assets/icons/bus.svg',
            //     iconSize: [40, 40],
            //     iconAnchor: [20, 20],
            //     popupAnchor: [0, -25],
            //     shadowUrl: './assets/icons/shadow.png',
            //     shadowSize: [80, 80],
            //     shadowAnchor: [40, 40],
            // }),
        });
        return marker.bindPopup(`${vehicle.vehicle?.id }`);
    }

    private async buildVehicleIcon(agencyId: string, routeId?: string | null): Promise<L.DivIcon> {
        const routeType = routeId ? (await this.stDataService.getRouteById(agencyId, routeId))?.route_type : undefined;
        const iconLink =  routeType ? this.getIconLinkFromRouteType(routeType) : this.getIconLinkFromRouteType(RouteType.Bus);
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

    private getIconLinkFromRouteType(type: RouteType): string {
        switch(type) {
            case RouteType.Subway:
                return './assets/icons/subway.svg#subway';
            case RouteType.Rail:
                return './assets/icons/train.svg#train';
            case RouteType.Bus:
                return './assets/icons/bus.svg#bus';
        }
        return '';
    }
}

import { Injectable } from '@angular/core';
import L from 'leaflet';
import { RealtimeDataService } from '../realtime/realtime-data.service';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

@Injectable({
    providedIn: 'root'
})
export class VehicleMarkerService {

    constructor(private rtDataService: RealtimeDataService) {}

    async createVehiclesLayer(agencyId: string, routeId: string): Promise<L.LayerGroup> {
        const vehicleMarkers = L.layerGroup();
        (await this.rtDataService.getVehiclesFromRoute(agencyId, routeId)).forEach(async vehicle => {
            const vehicleMarker = await this.buildVehicleMarker(vehicle);
            if (vehicleMarker) vehicleMarkers.addLayer(vehicleMarker);
        });

        return L.layerGroup().addLayer(vehicleMarkers);
    }

    async createAllVehiclesLayer(agencyId: string): Promise<L.LayerGroup> {
        const vehicleMarkers = L.layerGroup();
        (await this.rtDataService.getVehiclesFromAgency(agencyId)).forEach(async vehicle => {
            const vehicleMarker = await this.buildVehicleMarker(vehicle);
            if (vehicleMarker) vehicleMarkers.addLayer(vehicleMarker);
        });

        return L.layerGroup().addLayer(vehicleMarkers);
    }

    private async buildVehicleMarker(vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition)
        : Promise<L.Marker | undefined> {
        if (!vehicle.position) return;
        const marker = L.marker([vehicle.position.latitude, vehicle.position.longitude], {
            icon: await this.buildBusIcon(),
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

    private async buildBusIcon(): Promise<L.DivIcon> {
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
                    <circle cx="25" cy="25" r="20" fill="white"/>
                    <use
                        height="32" y="7"
                        xlink:href='./assets/icons/bus.svg#bus'
                        href="./assets/icons/bus.svg#bus"></use>
                </svg>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [0, -25],
          });
          
    }
}

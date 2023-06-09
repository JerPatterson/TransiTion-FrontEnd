import { Injectable } from '@angular/core';
import L from 'leaflet';
import { RealtimeDataService } from '../realtime/realtime-data.service';
import { Vehicle } from '@app/interfaces/vehicle';

@Injectable({
    providedIn: 'root'
})
export class VehicleMarkerService {
    
    constructor(private rtDataService: RealtimeDataService) {}

    async createVehiclesLayer(agencyId: string, routeId: string): Promise<L.LayerGroup> {
        const vehicleMarkers = L.layerGroup();
        (await this.rtDataService.getVehiclesFromRoute(agencyId, routeId)).forEach(async vehicle => {
            vehicleMarkers.addLayer(await this.buildVehicleMarker(vehicle));
        });

        return L.layerGroup().addLayer(vehicleMarkers);
    }

    private async buildVehicleMarker(vehicle: Vehicle): Promise<L.Marker> {
        const marker = L.marker([vehicle.location.lat, vehicle.location.lon], {
            icon: L.icon({
                iconUrl: './assets/icons/bus.png',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -25],
                shadowUrl: './assets/icons/shadow.png',
                shadowSize: [80, 80],
                shadowAnchor: [40, 40],
            }),
        });
        return marker.bindPopup(`${vehicle.id}`);
    }
}

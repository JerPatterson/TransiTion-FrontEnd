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
        const marker = L.marker([vehicle.position?.latitude, vehicle.position.longitude], {
            icon: L.icon({
                iconUrl: './assets/icons/bus.svg',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -25],
                shadowUrl: './assets/icons/shadow.png',
                shadowSize: [80, 80],
                shadowAnchor: [40, 40],
            }),
        });
        return marker.bindPopup(`${vehicle.vehicle?.id }`);
    }
}

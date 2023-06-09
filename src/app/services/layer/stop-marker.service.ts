import { Injectable } from '@angular/core';
import { Stop } from '@app/interfaces/gtfs';
import L from 'leaflet';
import { StaticTripDataService } from '@app/services/static/static-trip-data.service';
import { StaticStopDataService } from '@app/services/static/static-stop-data.service';

@Injectable({
    providedIn: 'root'
})
export class StopMarkerService {
    
    constructor(
        private staticStopDataService: StaticStopDataService,
        private staticTripDataService: StaticTripDataService,
    ) {}

    async createCurrentStopLayer(agencyId: string, stopId: string): Promise<L.LayerGroup> {
        const stop = await this.staticStopDataService.getStop(agencyId, stopId);
        return stop? L.layerGroup().addLayer(await this.buildStopMarker(stop)) : L.layerGroup();
    }

    async createOtherStopsLayer(agencyId: string, tripId: string, currentStopId: string): Promise<L.LayerGroup> {
        const stopMarkers = L.layerGroup();
        const stopIds = await this.staticTripDataService.getStopIds(tripId);
        stopIds.forEach(async stopId => {
            if (stopId === currentStopId) return;
            const stop = await this.staticStopDataService.getStop(agencyId, stopId);
            if (stop) stopMarkers.addLayer(await this.buildStopMarker(stop));
        });

        return stopMarkers;
    }

    private async buildStopMarker(stop: Stop): Promise<L.Marker> {
        const marker = L.marker([stop.location.lat, stop.location.lon], {
            icon: L.icon({
                iconUrl: stop.hasShelter ? './assets/icons/stop.png' : './assets/icons/stop-sign.png',
                iconSize: stop.hasShelter ? [35, 35] : [40, 40],
                iconAnchor: stop.hasShelter ? [17, 17] : [20, 20],
                popupAnchor: [0, -25],
                shadowUrl: './assets/icons/shadow.png',
                shadowSize: [80, 80],
                shadowAnchor: [40, 40],
            }),
        });

        return marker.bindPopup(`${stop.name} [${stop.id}]`);
    }
}

import { Injectable } from '@angular/core';
import L from 'leaflet';
import { StopDto } from '@app/utils/dtos';
import { StaticDataService } from '@app/services/static/static-data.service';

@Injectable({
    providedIn: 'root'
})
export class StopMarkerService {
    
    constructor(private staticDataService: StaticDataService) {}

    async createCurrentStopLayer(agencyId: string, stopId: string): Promise<L.LayerGroup> {
        const stop = await this.staticDataService.getStop(agencyId, stopId);
        return stop? L.layerGroup().addLayer(await this.buildStopMarker(stop)) : L.layerGroup();
    }

    async createOtherStopsLayer(agencyId: string, tripId: string, currentStopId: string): Promise<L.LayerGroup> {
        const stopMarkers = L.layerGroup();
        const stops = await this.staticDataService.getStopsFromTrip(agencyId, tripId);
        stops.forEach(async stop => {
            stopMarkers.addLayer(await this.buildStopMarker(stop));
        });

        return stopMarkers;
    }

    private async buildStopMarker(stop: StopDto): Promise<L.Marker> {
        const marker = L.marker([stop.stop_lat, stop.stop_lon], {
            icon: L.icon({
                iconUrl: stop.stop_shelter ? './assets/icons/stop.png' : './assets/icons/stop-sign.png',
                iconSize: stop.stop_shelter ? [35, 35] : [40, 40],
                iconAnchor: stop.stop_shelter ? [17, 17] : [20, 20],
                popupAnchor: [0, -25],
                shadowUrl: './assets/icons/shadow.png',
                shadowSize: [80, 80],
                shadowAnchor: [40, 40],
            }),
        });

        return marker.bindPopup(`${stop.stop_name} [${stop.stop_code}]`);
    }
}

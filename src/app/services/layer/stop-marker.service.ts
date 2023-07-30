import { Injectable } from '@angular/core';
import L from 'leaflet';
import { StopDto } from '@app/utils/dtos';
import { StaticDataService } from '@app/services/static/static-data.service';

@Injectable({
    providedIn: 'root'
})
export class StopMarkerService {
    private stopLayer?: L.LayerGroup;
    
    constructor(private staticDataService: StaticDataService) {}

    async createTripStopLayer(agencyId: string, tripId: string, color: string) {
        this.clearTripStopLayer();
        this.stopLayer = await this.buildTripStopLayer(
            agencyId, tripId, color
        );

        return this.stopLayer;
    }

    async clearTripStopLayer(): Promise<void> {
        this.stopLayer?.remove();
        this.stopLayer = undefined;
    }

    private async buildTripStopLayer(agencyId: string, tripId: string, color: string): Promise<L.LayerGroup> {
        const stopMarkers = await Promise.all(
            (await this.staticDataService.getStopsFromTrip(agencyId, tripId))
                .map(async (stop) => await this.buildStopMarker(stop, color))
        );

        return L.layerGroup(stopMarkers);
    }

    private async buildStopMarker(stop: StopDto, color: string): Promise<L.CircleMarker> {
        const marker = L.circleMarker([stop.stop_lat, stop.stop_lon], {
            radius: 5,
            fillOpacity: 1,
            color: color,
            fillColor: "#ffffff",
            pane: 'stopmarker',
        });
        return marker.bindPopup(`${stop.stop_name} [${stop.stop_code}]`);
    }
}

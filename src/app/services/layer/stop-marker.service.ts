import { Injectable } from '@angular/core';
import L from 'leaflet';
import { StopDto } from '@app/utils/dtos';
import { StaticDataService } from '@app/services/static/static-data.service';

@Injectable({
    providedIn: 'root'
})
export class StopMarkerService {
    
    constructor(private staticDataService: StaticDataService) {}

    async createStopLayerFromTrip(agencyId: string, tripId: string, color: string): Promise<L.LayerGroup> {
        let layerGroup = L.layerGroup();
        (await this.staticDataService.getStopsFromTrip(agencyId, tripId))
            .forEach(async (stop) => {
                layerGroup.addLayer(await this.buildStopMarker(stop, color));
            });

        return layerGroup;
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

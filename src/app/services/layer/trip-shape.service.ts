import { Injectable } from '@angular/core';
import { ShapePt } from '@app/interfaces/gtfs';
import L from 'leaflet';
import { StaticTripDataService } from '@app/services/static/static-trip-data.service';

@Injectable({
    providedIn: 'root'
})
export class TripShapeService {
    
    constructor(private staticTripDataService: StaticTripDataService) {}
    
    async createTripShapeLayer(agencyId: string, tripId: string): Promise<L.LayerGroup> {
        const shapeLayer = L.layerGroup();
        const shapeId = (await this.staticTripDataService.getTrip(tripId))?.shapeId;
        const shapePtList = await this.staticTripDataService.getShape(agencyId, shapeId ? shapeId : '');
        return shapeLayer.addLayer(await this.buildTripShape(shapePtList, '#0a2196', 1));
    }
    
    async createSecondaryTripShapeLayer(agencyId: string, tripIds: string[]): Promise<L.LayerGroup> {
        const shapeLayer = L.layerGroup();
        const shapeIds = tripIds.map(async tripId => (await this.staticTripDataService.getTrip(tripId))?.shapeId);
        const uniqueShapeIds = [...new Set(await Promise.all(shapeIds))];
        uniqueShapeIds.forEach(async id => {
            if (!id) return;
            const shapePtList = await this.staticTripDataService.getShape(agencyId, id);
            shapeLayer.addLayer(await this.buildTripShape(shapePtList, '#0a2196', 0.4));
        });
        return shapeLayer;
    }
    
    private async buildTripShape(shapePtList: ShapePt[], color: string, opacity: number): Promise<L.Polyline> {
        const pointList: L.LatLng[] = [];
        shapePtList.forEach(shapePt => pointList.push(L.latLng(shapePt.location.lat, shapePt.location.lon)));
        return new L.Polyline(pointList, { color, opacity, weight: 8, smoothFactor: 1 });
    }
}

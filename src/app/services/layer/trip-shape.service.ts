import { Injectable } from '@angular/core';
import { ShapePt } from '@app/interfaces/gtfs';
import L from 'leaflet';
import { StaticTripDataService } from '@app/services/static/static-trip-data.service';

@Injectable({
    providedIn: 'root'
})
export class TripShapeService {
    
    constructor(private staticTripDataService: StaticTripDataService) {}
    
    async createTripShapeLayer(agencyId: string, tripId: string, shapeColor: string): Promise<L.LayerGroup> {
        const shapeLayer = L.layerGroup();
        const shapeId = (await this.staticTripDataService.getTrip(tripId))?.shapeId;
        const shapePtList = await this.staticTripDataService.getShape(agencyId, shapeId ? shapeId : '');
        return shapeLayer.addLayer(await this.buildTripShape(shapePtList, shapeColor));
    }
    
    async createSecondaryTripShapeLayer(agencyId: string, tripIds: string[], shapeColor: string): Promise<L.LayerGroup> {
        const shapeLayer = L.layerGroup();
        const canvasRenderer = L.canvas({pane: 'semitransparent'});
        const shapeIds = tripIds.map(async tripId => (await this.staticTripDataService.getTrip(tripId))?.shapeId);
        const uniqueShapeIds = [...new Set(await Promise.all(shapeIds))];
        uniqueShapeIds.forEach(async id => {
            if (!id) return;
            const shapePtList = await this.staticTripDataService.getShape(agencyId, id);
            shapeLayer.addLayer(await this.buildTripShape(shapePtList, shapeColor, canvasRenderer));
        });
        return shapeLayer;
    }
    
    private async buildTripShape(shapePtList: ShapePt[], color: string, renderer?: L.Renderer): Promise<L.Polyline> {
        const pointList: L.LatLng[] = [];
        shapePtList.forEach(shapePt => pointList.push(L.latLng(shapePt.location.lat, shapePt.location.lon)));
        return new L.Polyline(pointList, { color, weight: 8, opacity: 1, smoothFactor: 1, renderer });
    }
}

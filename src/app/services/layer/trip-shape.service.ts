import { Injectable } from '@angular/core';
import L from 'leaflet';
import { StaticDataService } from '@app/services/static/static-data.service';
import { ShapeDto } from '@app/utils/dtos';

@Injectable({
    providedIn: 'root'
})
export class TripShapeService {

    constructor(private staticDataService: StaticDataService) {}
    
    async createTripShapeLayer(agencyId: string, tripId: string, shapeColor: string): Promise<L.LayerGroup> {
        const shapeLayer = L.layerGroup();
        const shapeId = (await this.staticDataService.getTrip(agencyId, tripId)).shape_id;
        const shapePts = await this.staticDataService.getShapeById(agencyId, shapeId);
        return shapeLayer.addLayer(await this.buildTripShape(shapePts, shapeColor));
    }
    
    async createSecondaryTripShapeLayer(agencyId: string, stopId: string, shapeColor: string): Promise<L.LayerGroup> {
        const shapeLayer = L.layerGroup();
        const canvasRenderer = L.canvas({pane: 'semitransparent'});
        const shapeIds = (await this.staticDataService.getTodayTripsFromStop(agencyId, stopId)).map((trip) => trip.shape_id);
        const uniqueShapeIds = [...new Set(await Promise.all(shapeIds))];
        uniqueShapeIds.forEach(async id => {
            const shapePts = await this.staticDataService.getShapeById(agencyId, id);
            shapeLayer.addLayer(await this.buildTripShape(shapePts, shapeColor, canvasRenderer));
        });
        return shapeLayer;
    }
    
    private async buildTripShape(shapePts: ShapeDto[], color: string, renderer?: L.Renderer): Promise<L.Polyline> {
        const pointList: L.LatLng[] = [];
        shapePts.forEach(shape => pointList.push(L.latLng(parseFloat(String(shape.shape_pt_lat)), parseFloat(String(shape.shape_pt_lon)))));
        return new L.Polyline(pointList, { color, weight: 8, opacity: 1, smoothFactor: 1, renderer });
    }
}

import { Injectable } from '@angular/core';
import { ShapePt } from '@app/interfaces/gtfs';
import L from 'leaflet';
import { StaticTripDataService } from '@app/services/static/static-trip-data.service';

@Injectable({
    providedIn: 'root'
})
export class TripShapeService {
    
    constructor(private staticTripDataService: StaticTripDataService) {}
    
    async createTripShapeLayer(agencyId: string, tripId: string): Promise<L.Polyline> {
        const shapePtList = await this.staticTripDataService.getShapeOfTrip(agencyId, tripId);
        return this.buildTripShape(shapePtList, '#0a2196', 1);
    }
    
    // private async addSecondaryTripShape(shapeIdValue: string): Promise<void> {
    //     const shapePtList = await this.stTripDataService.getShapeOfTrip(this.agencyId, shapeIdValue);
    //     const tripShape = await this.buildTripShape(shapePtList, '#0a2196', 0.4);
    // }
    
    private async buildTripShape(shapePtList: ShapePt[], color: string, opacity: number): Promise<L.Polyline> {
        const pointList: L.LatLng[] = [];
        shapePtList.forEach(shapePt => pointList.push(L.latLng(shapePt.location.lat, shapePt.location.lon)));
        return new L.Polyline(pointList, { color, opacity, weight: 8, smoothFactor: 1 });
    }
}

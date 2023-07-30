import { Injectable } from '@angular/core';
import L from 'leaflet';
import { StaticDataService } from '@app/services/static/static-data.service';
import { ShapeDto } from '@app/utils/dtos';
import { DEFAULT_ROUTE_COLOR, PARAM_SEPARATOR } from '@app/utils/constants';

@Injectable({
    providedIn: 'root'
})
export class TripShapeService {

    constructor(private staticDataService: StaticDataService) {}
    
    async createTripLayer(agencyId: string, tripId: string, color: string): Promise<L.LayerGroup> {
        const shapeId = (await this.staticDataService.getTripById(agencyId, tripId)).shape_id;
        const shapePts = await this.staticDataService.getShapeById(agencyId, shapeId);
        const canvasRenderer = L.canvas({pane: 'shapes'});
        return L.layerGroup([await this.buildTripShape(shapePts, color, canvasRenderer)], {pane: 'shapes'});
    }

    async createSemiTransparentTripsLayer(routes: string[]): Promise<L.LayerGroup> {
        const shapeIds = new Set<string>();
        const shapeLayer = L.layerGroup([], {pane: 'shapes'});
        const canvasRenderer = L.canvas({pane: 'semitransparent'});

        for (let route of routes) {
            const [agencyId, routeId] = route.split(PARAM_SEPARATOR);
            const trips = await this.staticDataService.getTodayTripsFromRoute(agencyId, routeId);

            for (let trip of trips) {
                if (!shapeIds.has(trip.shape_id)) {
                    shapeIds.add(trip.shape_id);
                    const shapeColor = await this.getShapeColor(agencyId, routeId);
                    const shapePts = await this.staticDataService.getShapeById(agencyId, trip.shape_id);
                    shapeLayer.addLayer(await this.buildTripShape(shapePts, shapeColor, canvasRenderer));
                }
            }
        }

        return shapeLayer;
    }
    
    private async buildTripShape(shapePts: ShapeDto[], color: string, renderer?: L.Renderer): Promise<L.Polyline> {
        const pointList: L.LatLng[] = [];
        shapePts.forEach(shape => pointList.push(L.latLng(parseFloat(String(shape.shape_pt_lat)), parseFloat(String(shape.shape_pt_lon)))));
        return new L.Polyline(pointList, { color, weight: 8, opacity: 1, smoothFactor: 1, renderer });
    }

    private async getShapeColor(agencyId: string, routeId?: string | null): Promise<string> {
        let color: string | undefined;
       if (routeId) color = (await this.staticDataService.getRouteById(agencyId, routeId))?.route_color;
       return color ? `#${color}` : DEFAULT_ROUTE_COLOR;
    }
}

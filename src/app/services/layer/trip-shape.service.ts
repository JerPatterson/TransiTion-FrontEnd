import { Injectable } from '@angular/core';
import L from 'leaflet';
import { StaticDataService } from '@app/services/static/static-data.service';
import { ShapeDto } from '@app/utils/dtos';
import { DEFAULT_ROUTE_COLOR } from '@app/utils/constants';
import { RouteId } from '@app/utils/component-interface';
import { GeoJsonObject } from 'geojson';

@Injectable({
    providedIn: 'root'
})
export class TripShapeService {
    private tripLayer = L.layerGroup();

    private currentRoutes = new Set<string>();
    private routeToRouteShapeLayer = new Map<string, L.GeoJSON>();

    constructor(private staticDataService: StaticDataService) {}

    async createTripShapeLayer(agencyId: string, tripId: string, color: string): Promise<L.LayerGroup> {
        this.clearTripShapeLayer();
        this.tripLayer = await this.buildTripShapeLayer(agencyId, tripId, color);
        return this.tripLayer;
    }

    async clearTripShapeLayer(): Promise<void> {
        this.tripLayer?.remove();
        this.tripLayer = L.layerGroup();
    }


    async addRouteShapeLayer(routeIds: RouteId[]): Promise<L.LayerGroup> {
        return L.layerGroup(await Promise.all(
            routeIds
                .filter((routeId) => 
                    !this.currentRoutes.has(`${routeId.agencyId}/${routeId.routeId}`)
                ).map((routeId) => {
                    this.currentRoutes.add(`${routeId.agencyId}/${routeId.routeId}`);
                    return this.buildRouteShapeLayer(routeId);
                })
            ),
            { pane: 'shapes' },
        ); 
    }

    async removeRouteShapeLayer(routeIds: RouteId[]): Promise<void> {
        const routes = new Set(routeIds
            .map((routeId) => `${routeId.agencyId}/${routeId.routeId}`));
        [...this.currentRoutes]
            .filter((route) => !routes.has(route))
            .forEach((removedRoute) => this.deleteRouteShapeLayer(removedRoute));
        this.currentRoutes = routes;
    }

    async clearRouteShapeLayers() {
        this.routeToRouteShapeLayer.forEach((layer) => layer.remove());
        this.routeToRouteShapeLayer = new Map<string, L.GeoJSON>();
        this.currentRoutes = new Set<string>();
    }


    private async buildTripShapeLayer(agencyId: string, tripId: string, color: string): Promise<L.LayerGroup> {
        const trip = await this.staticDataService.getTripById(agencyId, tripId);
        const shapePts = await this.staticDataService.getShapeById(agencyId, trip.shape_id);
        const renderer = L.canvas({ pane: 'shapes' });
        return L.layerGroup([await this.buildTripShape(shapePts, color, renderer)]);
    }

    private async buildTripShape(shapePts: ShapeDto[], color: string, renderer?: L.Renderer): Promise<L.GeoJSON> {
        const coords = shapePts.map(shape => [shape.shape_pt_lon, shape.shape_pt_lat]);
        const content = { type: 'LineString', coordinates: coords } as GeoJsonObject;
        const options = { style: { color, opacity: 1, weight: 8, renderer } }
        return new L.GeoJSON(content, options);
    }

    private async buildRouteShapeLayer(routeId: RouteId): Promise<L.GeoJSON> {
        const tripLayer = (await this.buildTripShapesLayer([routeId]));
        this.routeToRouteShapeLayer.set(`${routeId.agencyId}/${routeId.routeId}`, tripLayer);
        return tripLayer;
    }

    private async deleteRouteShapeLayer(route: string): Promise<void> {
        const tripsLayer = this.routeToRouteShapeLayer.get(route);
        if (!tripsLayer) return;
        tripsLayer.remove();
        this.routeToRouteShapeLayer.delete(route);
    }

    async buildTripShapesLayer(routeIds: RouteId[]): Promise<L.GeoJSON> {
        const shapeIds = new Set<string>();
        const shapeLayer = L.geoJSON();
        const canvasRenderer = L.canvas({ pane: 'semitransparent' });

        for (let routeId of routeIds) {
            const trips = await this.staticDataService.getTodayTripsFromRoute(routeId.agencyId, routeId.routeId);
            for (let trip of trips) {
                if (!shapeIds.has(trip.shape_id)) {
                    shapeIds.add(trip.shape_id);
                    const shapeColor = await this.getShapeColor(routeId.agencyId, routeId.routeId);
                    const shapePts = await this.staticDataService.getShapeById(routeId.agencyId, trip.shape_id);
                    shapeLayer.addLayer(await this.buildTripShape(shapePts, shapeColor, canvasRenderer));
                }
            }
        }
    
        return shapeLayer;
    }

    private async getShapeColor(agencyId: string, routeId: string): Promise<string> {
        const route = await this.staticDataService.getRouteById(agencyId, routeId);
        return route?.route_color ? `#${route.route_color}` : DEFAULT_ROUTE_COLOR;
    }
}

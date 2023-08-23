import { Injectable } from '@angular/core';
import L from 'leaflet';
import { StaticDataService } from '@app/services/static/static-data.service';
import { ShapeDto } from '@app/utils/dtos';
import { DEFAULT_SHAPE_COLOR } from '@app/utils/constants';
import { RouteId } from '@app/utils/component-interface';
import { GeoJsonObject } from 'geojson';
import { AGENCY_TO_STYLE } from '@app/utils/styles';

@Injectable({
    providedIn: 'root'
})
export class TripShapeService {
    private tripShapeLayer = L.layerGroup();
    private stopShapeLayer = L.layerGroup();

    private currentRoutes = new Set<string>();
    private routeToRouteShapeLayer = new Map<string, L.GeoJSON>();

    constructor(private staticDataService: StaticDataService) {}

    async createTripShapeLayer(agencyId: string, tripId: string, color: string): Promise<L.LayerGroup> {
        this.clearTripShapeLayer();
        this.tripShapeLayer = await this.buildTripShapeLayer(agencyId, tripId, color);
        return this.tripShapeLayer;
    }

    clearTripShapeLayer(): void {
        this.tripShapeLayer.remove();
        this.tripShapeLayer.clearLayers();
    }


    async createStopShapesLayer(
        agencyId: string,
        stopId: string,
        filterVehicles: (tIds: string[]) => void,
    ): Promise<L.LayerGroup> {
        this.clearTripShapeLayer();
        this.clearStopShapeLayer();
        const uniqueShapeIds = new Set<string>();
        const trips = (await this.staticDataService.getTodayTripsFromStop(agencyId, stopId))
            .filter((trip) => !this.currentRoutes.size || this.currentRoutes.has(trip.route_id));
    
        filterVehicles(trips.map((trip) => trip.trip_id));
        trips.forEach((trip) => uniqueShapeIds.add(trip.shape_id));
        this.stopShapeLayer = L.layerGroup(await this.buildStopShapes(agencyId, [...uniqueShapeIds]));

        return this.stopShapeLayer;
    }

    clearStopShapeLayer(): void {
        this.stopShapeLayer.remove();
        this.stopShapeLayer.clearLayers();
    }


    async addRouteShapeLayer(routeIds: RouteId[]): Promise<L.LayerGroup> {
        this.clearStopShapeLayer();
        return L.layerGroup(await Promise.all(
            routeIds
                .filter((routeId) => 
                    !this.currentRoutes.has(`${routeId.agencyId}/${routeId.routeId}`)
                ).map((routeId) => {
                    this.currentRoutes.add(`${routeId.agencyId}/${routeId.routeId}`);
                    return this.buildRouteShape(routeId);
                })
            ),
            { pane: 'tripshape' },
        ); 
    }

    async removeRouteShapeLayer(routeIds: RouteId[]): Promise<void> {
        this.clearStopShapeLayer();
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
        const renderer = L.canvas({ pane: 'tripshape' });
        return L.layerGroup([this.buildTripShape(shapePts, color, renderer)]);
    }

    private buildTripShape(shapePts: ShapeDto[], color: string, renderer?: L.Renderer): L.GeoJSON {
        const coords = shapePts.map(shape => [shape.shape_pt_lon, shape.shape_pt_lat]);
        const content = { type: 'LineString', coordinates: coords } as GeoJsonObject;
        const options = { interactive: false, style: { color, opacity: 1, weight: 8, renderer } }
        return new L.GeoJSON(content, options);
    }


    private async buildStopShapes(agencyId: string, shapeIds: string[]): Promise<L.GeoJSON[]> {
        const shapes: L.GeoJSON[] = [];
        const color = AGENCY_TO_STYLE.get(agencyId)?.backgroundColor;
        const renderer = L.canvas({ pane: 'routeshapes' });
        for (const shapeId of shapeIds) {
            const shapePts = await this.staticDataService.getShapeById(agencyId, shapeId);
            shapes.push(this.buildTripShape(shapePts, color ? color : DEFAULT_SHAPE_COLOR, renderer));
        }

        return shapes;
    }


    private async buildRouteShape(routeId: RouteId): Promise<L.GeoJSON> {
        const tripShapeLayer = await this.buildTripShapesLayer([routeId]);
        this.routeToRouteShapeLayer.set(`${routeId.agencyId}/${routeId.routeId}`, tripShapeLayer);
        return tripShapeLayer;
    }

    private deleteRouteShapeLayer(route: string): void {
        const tripsLayer = this.routeToRouteShapeLayer.get(route);
        if (!tripsLayer) return;
        tripsLayer.remove();
        this.routeToRouteShapeLayer.delete(route);
    }

    async buildTripShapesLayer(routeIds: RouteId[]): Promise<L.GeoJSON> {
        const shapeIds = new Set<string>();
        const shapeLayer = L.geoJSON([], { interactive: false });
        const canvasRenderer = L.canvas({ pane: 'routeshapes' });

        for (let routeId of routeIds) {
            const trips = await this.staticDataService.getTodayTripsFromRoute(routeId.agencyId, routeId.routeId);
            for (let trip of trips) {
                if (!shapeIds.has(trip.shape_id)) {
                    shapeIds.add(trip.shape_id);
                    const shapeColor = await this.getShapeColor(routeId.agencyId, routeId.routeId);
                    const shapePts = await this.staticDataService.getShapeById(routeId.agencyId, trip.shape_id);
                    shapeLayer.addLayer(this.buildTripShape(shapePts, shapeColor, canvasRenderer));
                }
            }
        }
    
        return shapeLayer;
    }

    private async getShapeColor(agencyId: string, routeId: string): Promise<string> {
        const route = await this.staticDataService.getRouteById(agencyId, routeId);
        return route?.route_color ? `#${route.route_color}` : DEFAULT_SHAPE_COLOR;
    }
}

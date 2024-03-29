import { Injectable } from '@angular/core';
import L from 'leaflet';
import { StaticDataService } from '@app/services/static/static-data.service';
import { ShapeDto, StopDto, TripDto } from '@app/utils/dtos';
import { DEFAULT_SHAPE_COLOR } from '@app/utils/constants';
import { RouteId } from '@app/utils/component-interface';
import { GeoJsonObject } from 'geojson';
import { AGENCY_TO_STYLE } from '@app/utils/styles';

@Injectable({
    providedIn: 'root'
})
export class TripShapeService {
    private tripLayerGroup = new L.LayerGroup();
    private stopLayerGroup = new L.LayerGroup();
    private stopRemainingLayerGroup = new L.LayerGroup();
    private routeLayerGroup = new L.LayerGroup();

    private layerIdsByRouteId = new Map<string, number[]>();
    private layerIdsByAgencyId = new Map<string, number[]>();


    constructor(private stDataService: StaticDataService) {}


    get tripLayer() {
        return this.tripLayerGroup;
    }

    get stopLayer() {
        return this.stopLayerGroup;
    }

    get stopRemainingLayer() {
        return this.stopRemainingLayerGroup;
    }

    get routeLayer() {
        return this.routeLayerGroup;
    }


    removeAgencies(agencyIds: string[]): void {
        agencyIds.forEach((agencyId) => {
            this.layerIdsByAgencyId.get(agencyId)?.forEach((layerId) => {
                this.tripLayer.removeLayer(layerId);
                this.stopLayer.removeLayer(layerId);
                this.stopRemainingLayer.removeLayer(layerId);
            });
            this.layerIdsByRouteId.delete(agencyId);
        })
    }

    clearTripLayer(): void {
        this.tripLayerGroup.clearLayers();
    }

    clearStopLayers(): void {
        this.clearTripLayer();
        this.stopLayerGroup.clearLayers();
        this.stopRemainingLayerGroup.clearLayers();
        this.layerIdsByAgencyId.clear();
    }

    hideStopRemainingLayer(): void {
        this.stopRemainingLayerGroup.remove();
    }


    async setTripLayer(agencyId: string, tripId: string, color: string): Promise<void> {
        this.clearTripLayer();
        const layer = await this.buildTripLayer(agencyId, tripId, color);
        this.tripLayerGroup.addLayer(layer);
        this.addLayerIdToAgency(agencyId, this.tripLayerGroup.getLayerId(layer));
    }

    async setStopLayer(
        agencyId: string,
        stopId: string,
        filterVehicles: (tIds: string[]) => Promise<void>,
        filterStops: (sIds: string[]) => Promise<void>,
    ): Promise<void> {
        this.clearStopLayers();
        const uniqueShapeIds = new Set<string>();
        const uniqueTripByShapeIds: TripDto[] = [];
        const trips = (await this.stDataService.getTodayTripsFromStop(agencyId, stopId))
            .filter((trip) => !this.layerIdsByRouteId.size
                || this.layerIdsByRouteId.has(`${agencyId}/${trip.route_id}`));
    
        await filterVehicles(trips.map((trip) => trip.trip_id));
        trips.forEach((trip) => {
            if (!uniqueShapeIds.has(trip.shape_id)) {
                uniqueShapeIds.add(trip.shape_id);
                uniqueTripByShapeIds.push(trip);
            }
        });

        (await this.buildStopLayer(agencyId, [...uniqueShapeIds]))
            .forEach((layer) => {
                this.stopLayerGroup.addLayer(layer);
                this.addLayerIdToAgency(agencyId, this.stopLayerGroup.getLayerId(layer));
            });
        (await this.buildStopRemainingLayer(agencyId, stopId, [...uniqueTripByShapeIds], filterStops))
            .forEach((layer) => {
                this.stopRemainingLayerGroup.addLayer(layer);
                this.addLayerIdToAgency(agencyId, this.stopRemainingLayerGroup.getLayerId(layer));
            });
    }


    async addRoutes(routeIds: RouteId[]): Promise<void> {
        routeIds.forEach(async (routeId) => {
            const layer = await this.buildRouteLayer(routeId);
            this.routeLayerGroup.addLayer(layer);
            const layerId = this.routeLayerGroup.getLayerId(layer);
            this.addLayerIdToRoute(`${routeId.agencyId}/${routeId.routeId}`, layerId);
        });
    }

    removeRoutes(routeIds: RouteId[]): void {
        routeIds.forEach((routeId) => {
            this.layerIdsByRouteId.get(`${routeId.agencyId}/${routeId.routeId}`)?.forEach((layerId) => {
                this.routeLayerGroup.removeLayer(layerId);
            });
            this.layerIdsByRouteId.delete(`${routeId.agencyId}/${routeId.routeId}`);
        })
    }


    private addLayerIdToRoute(routeId: string, layerId: number): void {
        let layerIds = this.layerIdsByRouteId.get(routeId);
        layerIds ? layerIds.push(layerId) : this.layerIdsByRouteId.set(routeId, [layerId]);
    }

    private addLayerIdToAgency(agencyId: string, layerId: number): void {
        let layerIds = this.layerIdsByAgencyId.get(agencyId);
        layerIds ? layerIds.push(layerId) : this.layerIdsByAgencyId.set(agencyId, [layerId]);
    }


    private async buildTripLayer(agencyId: string, tripId: string, color: string): Promise<L.GeoJSON> {
        const trip = await this.stDataService.getTripById(agencyId, tripId);
        const shapePts = await this.stDataService.getShapeById(agencyId, trip.shape_id);
        const renderer = L.canvas({ pane: 'shapeHighOpacity' });
        return this.buildShape(shapePts, color, renderer);
    }

    private async buildStopLayer(agencyId: string, shapeIds: string[]): Promise<L.GeoJSON[]> {
        const shapes: L.GeoJSON[] = [];
        const color = AGENCY_TO_STYLE.get(agencyId)?.backgroundColor;
        const renderer = L.canvas({ pane: 'shapeLowOpacity' });
        for (const shapeId of shapeIds) {
            const shapePts = await this.stDataService.getShapeById(agencyId, shapeId);
            shapes.push(this.buildShape(shapePts, color ? color : DEFAULT_SHAPE_COLOR, renderer));
        }

        return shapes;
    }

    private async buildStopRemainingLayer(
        agencyId: string,
        stopId: string,
        trips: TripDto[],
        filterStops: (sIds: string[]) => Promise<void>,
    ): Promise<L.GeoJSON[]> {
        const shapes: L.GeoJSON[] = [];
        const stop = await this.stDataService.getStopById(agencyId, stopId);
        const color = AGENCY_TO_STYLE.get(agencyId)?.backgroundColor;
        const renderer = L.canvas({ pane: 'shapeHighOpacity' });
        for (const trip of trips) {
            let i = 0;
            let stopDistTraveled = 0;
            const times = await this.stDataService.getTimesFromTrip(agencyId, trip.trip_id);
            for (let time of times) {
                if (time.stop_id === stopId || ++i === times.length) break;
                stopDistTraveled += this.getDistanceBetweenCoordinates(
                    time.stop_lat, time.stop_lon, times[i].stop_lat, times[i].stop_lon);
            }

            await filterStops(times.map((time) => time.stop_id).slice(i));

            const shapePts = await this.stDataService.getShapeById(agencyId, trip.shape_id);
            const nearestPt = await this.getNearestPoint(shapePts, stop, stopDistTraveled);
            if (!nearestPt) return shapes;
            shapes.push(this.buildShape(
                shapePts.filter((shapePt) =>
                    shapePt.shape_pt_sequence >= nearestPt.shape_pt_sequence
                        && shapePt.shape_dist_traveled >= stopDistTraveled),
                color ? color : DEFAULT_SHAPE_COLOR,
                renderer,
            ));
        }

        return shapes;
    }

    private async buildRouteLayer(routeId: RouteId): Promise<L.GeoJSON> {
        const shapeIds = new Set<string>();
        const shapeLayer = L.geoJSON([], { interactive: false });
        const canvasRenderer = L.canvas({ pane: 'shapeLowOpacity' });
        const trips = await this.stDataService.getTodayTripsFromRoute(routeId.agencyId, routeId.routeId);
        for (let trip of trips) {
            if (!shapeIds.has(trip.shape_id)) {
                shapeIds.add(trip.shape_id);
                const shapeColor = await this.getShapeColor(routeId.agencyId, routeId.routeId);
                const shapePts = await this.stDataService.getShapeById(routeId.agencyId, trip.shape_id);
                shapeLayer.addLayer(this.buildShape(shapePts, shapeColor, canvasRenderer));
            }
        }
    
        return shapeLayer;
    }


    private buildShape(shapePts: ShapeDto[], color: string, renderer?: L.Renderer): L.GeoJSON {
        const coords = shapePts.map(shape => [shape.shape_pt_lon, shape.shape_pt_lat]);
        const content = { type: 'LineString', coordinates: coords } as GeoJsonObject;
        const options = { interactive: false, style: { color, opacity: 1, weight: 8, renderer } }
        return new L.GeoJSON(content, options);
    }

    private async getShapeColor(agencyId: string, routeId: string): Promise<string> {
        const route = await this.stDataService.getRouteById(agencyId, routeId);
        return route?.route_color ? `#${route.route_color}` : DEFAULT_SHAPE_COLOR;
    }

    private async getNearestPoint(
        shapePts: ShapeDto[], stop: StopDto, stopDistTraveled: number
    ): Promise<ShapeDto | undefined> {
        return shapePts.map((shapePt) => {
            return {
                ...shapePt,
                distFromStop: this.getSquareDistanceBetweenCoordinates(
                    stop.stop_lat, stop.stop_lon, shapePt.shape_pt_lat, shapePt.shape_pt_lon),
            };
        }).sort((a, b) => {
            return a.distFromStop - b.distFromStop;
        }).find((shapePt) => {
            return stopDistTraveled < shapePt.shape_dist_traveled;
        });
    }

    private getDistanceBetweenCoordinates(aLat: number, aLon: number, bLat: number, bLon: number): number {
        return Math.sqrt(this.getSquareDistanceBetweenCoordinates(aLat, aLon, bLat, bLon));
    }

    private getSquareDistanceBetweenCoordinates(aLat: number, aLon: number, bLat: number, bLon: number): number {
        return Math.pow((aLat -bLat) * 110.574, 2)
            + Math.pow((aLon - bLon) * 111.320 
            * Math.cos((aLat + bLat) / 2 * Math.PI / 180), 2)
    }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import L from 'leaflet';
import { VehicleMarkerService } from '@app/services/layer/vehicle-marker.service';
import { DEFAULT_ZOOM, LOCATION_CENTER_ZOOM, MAX_ZOOM, MIN_ZOOM, ONE_SEC_IN_MS, PARAM_SEPARATOR, SHOW_STOP_ABOVE_ZOOM } from '@app/utils/constants';
import { TripShapeService } from '@app/services/layer/trip-shape.service';
import { MapRenderingOptions, RouteId, StopId, VehicleId } from '@app/utils/component-interface';
import { StopMarkerService } from '@app/services/layer/stop-marker.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    @Input() lat: number = 45.6;
    @Input() lon: number = -73.75;

    @Input() set darkModeEnable(value: boolean) {
        this.options.darkModeEnable = value;
    }

    @Input() set showOldVehicles(value: boolean) {
        this.options.showOldVehicles = value;
        this.updateVehicles();
    }

    @Input() set useVehicleClusters(value: boolean) {
        this.options.useVehicleClusters = value;
        this.updateVehicles();
    }

    @Input() set mergeAllVehicleClusters(value: boolean) {
        this.options.mergeAllVehicleClusters = value;
        this.updateVehicles();
    }


    @Input() set agencies(values: string[]) {
        this.updateAgencies(values).then(() => {
            this.updateVehicles().then(() => {
                if (!this.stopIds.size) this.updateStops();
            })
        });
    };

    @Input() set routes(routeIds: RouteId[]) {
        this.updateRoutes(routeIds).then(() => {
            this.updateVehicles().then(() => {
                if (!this.stopIds.size) this.updateStops();
            })
        });
    };

    @Input() set stops(stopIds: StopId[]) {
        this.updateStops(stopIds);
    };

    @Input() set vehicle(value: VehicleId | null | undefined) {
        if (!value) {
            this.stopMarkerService.clearTripStopsLayer();
            this.tripShapeService.clearTripShapeLayer();
            if (!this.stopIds.size) this.updateStops();
        }
    }

    @Output() newVehicleSelected = new EventEmitter<VehicleId>();
    @Output() newStopSelected = new EventEmitter<StopId>();

    private map!: L.Map;
    private stopsLayer?: L.LayerGroup;
    private tripStopsLayer?: L.LayerGroup;

    private agencyIds: string[] = [];
    private routeIds = new Set<string>();
    private stopIds = new Set<string>();
    private tripIds: string[] = [];

    private options: MapRenderingOptions = {
        darkModeEnable: false,
        showOldVehicles: false,
        useVehicleClusters: true,
        mergeAllVehicleClusters: false,
    };


    private readonly emitStopSelected = (stopId: StopId) => {
        this.newStopSelected.emit(stopId);
        this.addTripsFromStop(stopId.agencyId, stopId.stopId);
    };

    private readonly centerMapOnLocation = (lat: number, lon: number) => {
        this.map.setView([lat, lon], LOCATION_CENTER_ZOOM);
    };

    private filterVehiclesFromTripIds = (_: string[]) => {}

    private readonly emitVehicleSelected = (vehicleId: VehicleId, tripId: string, color: string) => {
        this.newVehicleSelected.emit(vehicleId);
        this.addTripShape(vehicleId.agencyId, tripId, color);
        this.addTripStops(vehicleId.agencyId, tripId, color);
    };

    constructor(
        private vehicleMarkerService: VehicleMarkerService,
        private stopMarkerService: StopMarkerService,
        private tripShapeService: TripShapeService,
    ) {}

    ngOnInit(): void {
        this.initMap();
        setInterval(() => this.updateVehicles(), 30 * ONE_SEC_IN_MS);
    }
    
    private initMap(): void {
        this.map = L.map('map', {
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            zoomControl: false,
        }).setView([this.lat, this.lon], DEFAULT_ZOOM);

        this.map.invalidateSize({ animate: true });
        this.setBaseLayerControl();
        this.setMapPanes();

        this.map.on('zoomend', () => {
            this.addLayerIfHigherZoomLevel(this.stopsLayer, SHOW_STOP_ABOVE_ZOOM);
            this.addLayerIfHigherZoomLevel(this.tripStopsLayer, SHOW_STOP_ABOVE_ZOOM);
        });
    }


    private async updateAgencies(agencyIds: string[]): Promise<void> {
        this.agencyIds = agencyIds;
    }


    private async updateVehicles(): Promise<void> {
        if (this.tripIds.length) {
            this.filterVehiclesFromTripIds(this.tripIds);
        } else if (!this.routeIds.size) {
            await this.addAllVehicles();
        } else {
            await this.addAllVehiclesFromRoutes();
        }
    }

    private async addAllVehicles(): Promise<void> {
        (await this.vehicleMarkerService.createVehiclesLayer(
            this.agencyIds, this.options, this.emitVehicleSelected
        )).addTo(this.map);
        if (!this.options.useVehicleClusters)
            this.map.setZoom(this.map.getZoom());
    }

    private async addAllVehiclesFromRoutes(): Promise<void> {
        (await this.vehicleMarkerService.createRouteVehiclesLayer(
            [...this.routeIds], this.options, this.emitVehicleSelected
        )).addTo(this.map);
        if (!this.options.useVehicleClusters)
            this.map.setZoom(this.map.getZoom());
    }

    private async addVehiclesFromTrips(agencyId: string, tripIds: string[]) {
        (await this.vehicleMarkerService.createTripVehiclesLayer(
            agencyId, tripIds, this.options, this.emitVehicleSelected
        )).addTo(this.map);
        if (!this.options.useVehicleClusters)
            this.map.setZoom(this.map.getZoom());
    }


    private async addTripStops(agencyId: string, tripId: string, color: string): Promise<void> {
        this.stopsLayer = undefined;
        this.stopMarkerService.clearStopsLayer();
        this.tripStopsLayer = (await this.stopMarkerService.createTripStopsLayer(agencyId, tripId, color)).addTo(this.map);
    }

    private async addLayerIfHigherZoomLevel(layer: L.LayerGroup | undefined, comparisonZoomLevel: number) {
        if (!layer) return;
        if (!this.map.hasLayer(layer) && this.map.getZoom() > comparisonZoomLevel) {
            this.map.addLayer(layer);
        } else if (this.map.hasLayer(layer) && this.map.getZoom() <= comparisonZoomLevel) {
            this.map.removeLayer(layer);
        }
    }


    private async updateRoutes(routeIds: RouteId[]): Promise<void> {
        if (!routeIds.length) {
            this.routeIds.clear();
            await this.tripShapeService.clearRouteShapeLayers();
        } else if (routeIds.length > this.routeIds.size) {
            await this.addRouteShapes(routeIds);
        } else if (routeIds.length < this.routeIds.size) {
            await this.removeRouteShapes(routeIds);
        }

        this.tripStopsLayer = undefined;
        this.stopMarkerService.clearTripStopsLayer();
        this.tripShapeService.clearTripShapeLayer();
    }

    private async addTripShape(agencyId: string, tripId: string, color: string): Promise<void> {
        (await this.tripShapeService.createTripShapeLayer(agencyId, tripId, color)).addTo(this.map);
    }

    private async addRouteShapes(routeIds: RouteId[]): Promise<void> {
        routeIds.forEach((routeId) => {
            this.routeIds.add(`${routeId.agencyId}/${routeId.routeId}`);
        });
        (await this.tripShapeService.addRouteShapeLayer(routeIds)).addTo(this.map);
    }

    private async removeRouteShapes(routeIds: RouteId[]): Promise<void> {
        const routes = new Set(routeIds
            .map((routeId) => `${routeId.agencyId}/${routeId.routeId}`));
        const routesToDelete = [...this.routeIds].filter((route) => !routes.has(route));
        routesToDelete.forEach((route) => this.routeIds.delete(route));
        await this.tripShapeService.removeRouteShapeLayer(
            [...this.routeIds].map((route) => {
                return {
                    agencyId: route.split(PARAM_SEPARATOR)[0],
                    routeId: route.split(PARAM_SEPARATOR)[1],
                }
            })
        );
    }


    private async updateStops(stopIds: StopId[] = []) {
        if (!stopIds.length && !this.routeIds.size) {
            this.stopIds.clear();
            await this.addAllStops();
        } else if (!stopIds.length && this.routeIds.size) {
            this.stopIds.clear();
            await this.addAllStopsFromRoutes();
        } else {
            await this.addSelectedStops(stopIds);
        }
        this.addLayerIfHigherZoomLevel(this.stopsLayer, SHOW_STOP_ABOVE_ZOOM);
    }

    private async addAllStops(): Promise<void> {
        if (this.stopsLayer) this.map.removeLayer(this.stopsLayer);
        this.stopsLayer = (await this.stopMarkerService.createAllStopsLayer(
            this.agencyIds,
            this.emitStopSelected,
        ));
    }

    private async addAllStopsFromRoutes(): Promise<void> {
        if (this.stopsLayer) this.map.removeLayer(this.stopsLayer);
        const routeIds = [...this.routeIds].map((routeId) => { 
            return { 
                agencyId: routeId.split(PARAM_SEPARATOR)[0],
                routeId: routeId.split(PARAM_SEPARATOR)[1],
            }
        });

        this.stopsLayer = (await this.stopMarkerService.createAllRouteStopsLayer(
            routeIds,
            this.emitStopSelected,
        ));
    }


    private async addSelectedStops(stopIds: StopId[]): Promise<void> {
        let centerTheMap = false;
        if (stopIds.length > this.stopIds.size) {
            centerTheMap = true;
            stopIds.forEach((stopId) => {
                this.stopIds.add(`${stopId.agencyId}/${stopId.stopId}`);
            });
        } else if (stopIds.length < this.stopIds.size) {
            this.stopIds = new Set(stopIds.map((stopId) => 
                `${stopId.agencyId}/${stopId.stopId}`)
            );
        }

        this.stopsLayer = (await this.stopMarkerService.createStopsLayer(
            stopIds, 
            this.emitStopSelected,
            centerTheMap ? this.centerMapOnLocation : undefined
        )).addTo(this.map);
    }


    private async addTripsFromStop(agencyId: string, stopId: string): Promise<void> {
        this.filterVehiclesFromTripIds = (tripIds: string[]) => {
            this.tripIds = tripIds;
            this.addVehiclesFromTrips(agencyId, tripIds);
        };
        (await this.tripShapeService.createStopShapesLayer(
            agencyId, stopId, this.filterVehiclesFromTripIds
        )).addTo(this.map);
    }


    private setBaseLayerControl() {
        const TOMTOM_URL = 'https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=3GZCUZbHUOBdGhlDtQiCvnBskUWTev4L&tileSize=256&language=fr-FR';
        const OSM_URL = 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png';
        const ARCGIS_URL = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

        const TomTomTileLayer = L.tileLayer(TOMTOM_URL, { attribution: '&copy; <a href="https://tomtom.com" target="_blank">1992 - 2023 TomTom.</a> ', subdomains: 'abcd' });
        const OSMTileLayer = L.tileLayer(OSM_URL, { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
        const ArcGISLayer = L.tileLayer(ARCGIS_URL, { attribution: '&copy; <a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' });

        TomTomTileLayer.addTo(this.map);
        const layerControl = L.control.layers({}).addTo(this.map);
        layerControl.addBaseLayer(TomTomTileLayer, 'TomTom');
        layerControl.addBaseLayer(OSMTileLayer, 'OpenStreetMaps');
        layerControl.addBaseLayer(ArcGISLayer, 'ArcGIS Satellite');
    }

    private setMapPanes() {
        this.map.createPane('marker');
        (this.map.getPane('marker') as HTMLElement).style.zIndex = '398';

        this.map.createPane('tripshape');
        (this.map.getPane('tripshape') as HTMLElement).style.zIndex = '397';

        this.map.createPane('routeshapes');
        (this.map.getPane('routeshapes') as HTMLElement).style.zIndex = '396';
        (this.map.getPane('routeshapes') as HTMLElement).style.opacity = '0.5';
    }
}
    
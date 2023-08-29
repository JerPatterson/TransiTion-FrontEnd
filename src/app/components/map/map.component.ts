import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import L from 'leaflet';
import { VehicleMarkerService } from '@app/services/layer/vehicle-marker.service';
import {
    DEFAULT_ZOOM,
    LOCATION_CENTER_ZOOM,
    MAX_ZOOM,
    MIN_ZOOM,
    ONE_SEC_IN_MS,
    PARAM_SEPARATOR,
    SHOW_STOP_ABOVE_ZOOM,
} from '@app/utils/constants';
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
        const agencyIdsAdded = values.filter((value) => !this.agencyIds.has(value));
        const agencyIdsRemoved = [...this.agencyIds].filter((value) => !values.includes(value));
        this.updateAgencies(agencyIdsAdded, agencyIdsRemoved);
    };

    @Input() set routes(routeIds: RouteId[]) {
        const routeIdsSet = new Set(routeIds.map((routeId) => `${routeId.agencyId}/${routeId.routeId}`));
        const routeIdsAdded = routeIds.filter((routeId) => !this.routeIds.has(`${routeId.agencyId}/${routeId.routeId}`));
        const routeIdsRemoved = [...this.routeIds]
            .filter((routeId) => !routeIdsSet.has(routeId))
            .map((routeId) => {
                return {
                    agencyId: routeId.split(PARAM_SEPARATOR)[0],
                    routeId: routeId.split(PARAM_SEPARATOR)[1],
                }
            });
        this.updateRoutes(routeIdsAdded, routeIdsRemoved);
    };

    @Input() set stops(stopIds: StopId[]) {
        const stopIdsSet = new Set(stopIds.map((stopId) => `${stopId.agencyId}/${stopId.stopId}`));
        const stopIdsAdded = stopIds.filter((stopId) => !this.stopIds.has(`${stopId.agencyId}/${stopId.stopId}`));
        const stopIdsRemoved = [...this.stopIds]
            .filter((stopId) => !stopIdsSet.has(stopId))
            .map((stopId) => {
                return {
                    agencyId: stopId.split(PARAM_SEPARATOR)[0],
                    stopId: stopId.split(PARAM_SEPARATOR)[1],
                }
            });
        this.updateStops(stopIdsAdded, stopIdsRemoved);
    };

    @Input() set vehicle(value: VehicleId | null | undefined) {
        this.vehicleId = value;
        if (!this.map) return;
        if (this.vehicleId) {
            this.stopMarkerService.hideStopLayer();
            this.stopMarkerService.hideStopTripsLayer();
        } else {
            this.tripShapeService.clearTripLayer();
            this.tripShapeService.stopRemainingLayer.addTo(this.map);
            this.stopMarkerService.clearTripLayer();
            if (!this.stopIds.size) this.updateStops();
        }
    }

    @Input() set stop(value: StopId | null | undefined) {
        this.stopId = value;
        if (!this.map) return;
        if (this.stopId) {
            this.stopMarkerService.hideStopLayer();
        } else {
            this.filterTripIds = [];
            this.filterStopIds = [];
            this.tripShapeService.clearStopLayers();
            this.stopMarkerService.clearStopTripsLayer();
            this.updateVehicles()
                .then(() => this.updateStops());
        }
    }

    @Output() newVehicleSelected = new EventEmitter<VehicleId>();
    @Output() newStopSelected = new EventEmitter<StopId>();

    private map!: L.Map;

    private agencyIds = new Set<string>();
    private routeIds = new Set<string>();
    private stopIds = new Set<string>();

    private stopId?: StopId | null;
    private vehicleId?: VehicleId | null;
    private filterTripIds: string[] = [];
    private filterStopIds: string[] = [];

    private options: MapRenderingOptions = {
        darkModeEnable: false,
        showOldVehicles: false,
        useVehicleClusters: true,
        mergeAllVehicleClusters: false,
    };


    private get isFilteringOnAgencies(): boolean {
        return this.routeIds.size === 0 && this.filterTripIds.length === 0;
    }

    private get isFilteringOnRoutes(): boolean {
        return this.routeIds.size !== 0 && this.filterTripIds.length === 0;
    }

    private get isFilteringOnTrips(): boolean {
        return this.filterTripIds.length !== 0;
    }


    private readonly emitStopSelected = (stopId: StopId) => {
        this.newStopSelected.emit(stopId);
        if (!this.routeIds.size)
            this.addTripsFromStop(stopId.agencyId, stopId.stopId);
    };

    private readonly centerMapOnLocation = (lat: number, lon: number) => {
        this.map.setView([lat, lon], LOCATION_CENTER_ZOOM);
    };

    private filterVehiclesFromTrips = async (_: string[]) => {}
    private filterStopsFromTrips = async (_: string[]) => {}

    private readonly emitVehicleSelected = (vehicleId: VehicleId, tripId: string, color: string) => {
        this.newVehicleSelected.emit(vehicleId);
        this.addTrip(vehicleId.agencyId, tripId, color);
    };

    constructor(
        private vehicleMarkerService: VehicleMarkerService,
        private stopMarkerService: StopMarkerService,
        private tripShapeService: TripShapeService,
    ) {}

    ngOnInit(): void {
        this.initMap();
        this.tripShapeService.tripLayer.addTo(this.map);
        this.tripShapeService.stopLayer.addTo(this.map);
        this.tripShapeService.stopRemainingLayer.addTo(this.map);
        this.tripShapeService.routeLayer.addTo(this.map);
        this.stopMarkerService.stopTripsLayer.addTo(this.map);
        this.vehicleMarkerService.vehicleLayer.addTo(this.map);
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

        this.map.on('zoomend', () => this.handleZoomEndEvent());
    }


    private async handleZoomEndEvent() {
        if (!this.vehicleId && !this.stopId) {
            await this.addLayerIfHigherZoomLevel(this.stopMarkerService.stopLayer, SHOW_STOP_ABOVE_ZOOM);
        } else if (!this.vehicleId) {
            await this.addLayerIfHigherZoomLevel(this.stopMarkerService.stopTripsLayer, SHOW_STOP_ABOVE_ZOOM)
        } else if (this.vehicleId) {
            await this.addLayerIfHigherZoomLevel(this.stopMarkerService.tripLayer, SHOW_STOP_ABOVE_ZOOM);
        }
    }


    private async updateAgencies(agencyIdsAdded: string[], agencyIdsRemoved: string[]): Promise<void> {
        agencyIdsAdded.forEach((agencyId) => this.agencyIds.add(agencyId));
        agencyIdsRemoved.forEach((agencyId) => this.agencyIds.delete(agencyId));

        if (!this.map) return;
        if (this.isFilteringOnAgencies) {
            await this.updateStops();
            if (this.options.mergeAllVehicleClusters) {
                await this.updateVehicles();
            } else {
                this.vehicleMarkerService.removeAgencies(agencyIdsRemoved);
                await this.vehicleMarkerService.addAgencies(
                    agencyIdsAdded, this.options, this.emitVehicleSelected);
            }
        }

        this.tripShapeService.removeAgencies(agencyIdsRemoved);
        this.stopMarkerService.removeAgencies(agencyIdsRemoved);
    }

    private async updateRoutes(routeIdsAdded: RouteId[], routeIdsRemoved: RouteId[]): Promise<void> {
        routeIdsAdded.forEach((routeId) => this.routeIds.add(`${routeId.agencyId}/${routeId.routeId}`));
        routeIdsRemoved.forEach((routeId) => this.routeIds.delete(`${routeId.agencyId}/${routeId.routeId}`));
    
        if (!this.map) return;
        if (this.isFilteringOnAgencies)
            this.stopMarkerService.clearStopLayer();
        this.tripShapeService.removeRoutes(routeIdsRemoved);
        this.stopMarkerService.removeRoutes(routeIdsRemoved);

        await this.updateStops();
        await this.updateVehicles();
        await this.tripShapeService.addRoutes(routeIdsAdded);
    }

    private async updateStops(stopIdsAdded?: StopId[], stopIdsRemoved?: StopId[]) {
        stopIdsAdded?.forEach((stopId) => this.stopIds.add(`${stopId.agencyId}/${stopId.stopId}`));
        stopIdsRemoved?.forEach((stopId) => this.stopIds.delete(`${stopId.agencyId}/${stopId.stopId}`));

        if (stopIdsAdded && stopIdsRemoved) {
            this.stopMarkerService.addSelectedStops(
                stopIdsAdded, this.emitStopSelected, this.centerMapOnLocation);
            this.stopMarkerService.removeSelectedStops(stopIdsRemoved);
        } else if (this.isFilteringOnAgencies) {
            await this.stopMarkerService.addAgencies(
                [...this.agencyIds], this.emitStopSelected);
        } else if (this.isFilteringOnRoutes) {
            this.stopMarkerService.removeAgencies([...this.agencyIds]);
            await this.stopMarkerService.addRoutes(
                [...this.routeIds], this.emitStopSelected);
        } else if (this.isFilteringOnTrips) {
            await this.filterStopsFromTrips(this.filterStopIds);
        }
    }

    private async updateVehicles(): Promise<void> {
        if (this.isFilteringOnAgencies) {
            await this.vehicleMarkerService.updateLayerFromAgencies(
                [...this.agencyIds], this.options, this.emitVehicleSelected);
        } else if (this.isFilteringOnRoutes) {
            await this.vehicleMarkerService.updateLayerFromRoutes(
                [...this.routeIds], this.options, this.emitVehicleSelected);
        } else if (this.isFilteringOnTrips) {
            await this.filterVehiclesFromTrips(this.filterTripIds);
        }
        
        if (!this.options.useVehicleClusters)
            this.map.setZoom(this.map.getZoom());
    }


    private async addVehiclesFromTrips(agencyId: string, tripIds: string[]) {
        await this.vehicleMarkerService.updateLayerFromTrips(
            agencyId, tripIds, this.options, this.emitVehicleSelected);
    }

    private async addTrip(agencyId: string, tripId: string, color: string): Promise<void> {
        this.tripShapeService.hideStopRemainingLayer();
        await this.tripShapeService.setTripLayer(agencyId, tripId, color);
        await this.stopMarkerService.setTripLayer(agencyId, tripId, color);
    }

    private async addLayerIfHigherZoomLevel(layer: L.LayerGroup | undefined, comparisonZoomLevel: number) {
        if (!layer) return;
        if (!this.map.hasLayer(layer) && this.map.getZoom() > comparisonZoomLevel) {
            this.map.addLayer(layer);
        } else if (this.map.hasLayer(layer) && this.map.getZoom() <= comparisonZoomLevel) {
            this.map.removeLayer(layer);
        }
    }


    private async addTripsFromStop(agencyId: string, stopId: string): Promise<void> {
        this.filterVehiclesFromTrips = async (tripIds: string[]) => {
            this.filterTripIds = tripIds;
            await this.addVehiclesFromTrips(agencyId, tripIds);
        };

        this.filterStopsFromTrips = async (stopIds: string[]) => {
            this.filterStopIds = this.filterStopIds.concat(stopIds);
            this.stopMarkerService.hideStopLayer();
            await this.stopMarkerService.addStops(
                agencyId, stopIds, this.emitStopSelected);
        };

        await this.tripShapeService.setStopLayer(
            agencyId, stopId, this.filterVehiclesFromTrips, this.filterStopsFromTrips
        );
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

        this.map.createPane('shapeHighOpacity');
        (this.map.getPane('shapeHighOpacity') as HTMLElement).style.zIndex = '397';

        this.map.createPane('shapeLowOpacity');
        (this.map.getPane('shapeLowOpacity') as HTMLElement).style.zIndex = '396';
        (this.map.getPane('shapeLowOpacity') as HTMLElement).style.opacity = '0.5';
    }
}
    
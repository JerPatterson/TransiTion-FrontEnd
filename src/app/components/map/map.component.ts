import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import L from 'leaflet';
import { VehicleMarkerService } from '@app/services/layer/vehicle-marker.service';
import { MAX_ZOOM, MIN_ZOOM } from '@app/utils/constants';
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
    @Input() zoom: number = 12;

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
        this.agencyIds = values;
        this.updateVehicles();
    };

    @Input() set routes(routeIds: RouteId[]) {
        this.updateRoutes(routeIds);
    };

    @Input() set stops(stopIds: StopId[]) {
        this.updateStops(stopIds);
    };

    @Input() set vehicle(value: VehicleId | null | undefined) {
        if (!value) this.tripShapeService.clearTripShapeLayer();
    }

    @Output() newVehicleSelected = new EventEmitter<VehicleId>();

    private map!: L.Map;
    private stopsLayer?: L.LayerGroup;
    private tripStopsLayer?: L.LayerGroup;

    private agencyIds: string[] = [];
    private routeIds = new Set<string>();
    private stopIds = new Set<string>();

    private options: MapRenderingOptions = {
        darkModeEnable: false,
        showOldVehicles: false,
        useVehicleClusters: true,
        mergeAllVehicleClusters: false,
    };

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
    }
    
    private initMap(): void {
        this.map = L.map('map', {
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            zoomControl: false,
            preferCanvas: true,
        }).setView([this.lat, this.lon], this.zoom);

        this.map.invalidateSize({ animate: true });
        this.setBaseLayerControl();
        this.setMapPanes();

        this.map.on('zoomend', () => {
            this.addLayerIfHigherZoomLevel(this.stopsLayer, 12);
            this.addLayerIfHigherZoomLevel(this.tripStopsLayer, 12);
        });
    }


    private async updateVehicles(): Promise<void> {
        await this.vehicleMarkerService.clearVehiclesLayer();
        if (!this.routeIds.size) {
            this.addAllVehicles();
        } else {
            this.addAllVehiclesFromRoutes();
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


    private async addTripStops(agencyId: string, tripId: string, color: string): Promise<void> {
        this.tripStopsLayer = (await this.stopMarkerService.createTripStopsLayer(agencyId, tripId, color)).addTo(this.map);
    }

    private async addLayerIfHigherZoomLevel(layer: L.Layer | undefined, comparisonZoomLevel: number) {
        if (this.map.getZoom() > comparisonZoomLevel) {
            layer?.addTo(this.map);
        } else if (layer && this.map.hasLayer(layer)) {
            layer?.remove();
        }
    }


    private updateRoutes(routeIds: RouteId[]): void {
        if (!routeIds.length) {
            this.tripShapeService.clearRouteShapeLayers();
            this.routeIds.clear();
        } else if (routeIds.length > this.routeIds.size) {
            this.addRouteShapes(routeIds);
        } else if (routeIds.length < this.routeIds.size) {
            this.removeRouteShapes(routeIds);
        }

        this.updateVehicles();
        this.stopsLayer = undefined;
        this.tripStopsLayer = undefined;
        this.stopMarkerService.clearStopsLayer();
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
        routeIds.forEach((routeId) => {
            this.routeIds.delete(`${routeId.agencyId}/${routeId.routeId}`);
        });
        await this.tripShapeService.removeRouteShapeLayer(routeIds);
    }


    private async updateStops(stopIds: StopId[]) {
        if (!stopIds.length) {
            this.stopIds.clear();
        } else if (stopIds.length > this.stopIds.size) {
            stopIds.forEach((stopId) => {
                this.stopIds.add(`${stopId.agencyId}/${stopId.stopId}`);
            });
        } else if (stopIds.length < this.stopIds.size) {
            this.stopIds = new Set(stopIds.map((stopId) => 
                `${stopId.agencyId}/${stopId.stopId}`)
            );
        }

        this.stopsLayer = (await this.stopMarkerService.createStopsLayer(stopIds)).addTo(this.map);
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
        this.map.createPane('vehiclemarker');
        (this.map.getPane('vehiclemarker') as HTMLElement).style.zIndex = '399';

        this.map.createPane('stopmarker');
        (this.map.getPane('stopmarker') as HTMLElement).style.zIndex = '398';

        this.map.createPane('tripshape');
        (this.map.getPane('tripshape') as HTMLElement).style.zIndex = '397';

        this.map.createPane('routeshapes');
        (this.map.getPane('routeshapes') as HTMLElement).style.zIndex = '396';
        (this.map.getPane('routeshapes') as HTMLElement).style.opacity = '0.5';
    }
}
    
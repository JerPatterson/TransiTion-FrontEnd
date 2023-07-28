import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import L from 'leaflet';
import { VehicleMarkerService } from '@app/services/layer/vehicle-marker.service';
import { MAX_ZOOM, MIN_ZOOM, ONE_SEC_IN_MS, PARAM_SEPARATOR } from '@app/utils/constants';
import { TripShapeService } from '@app/services/layer/trip-shape.service';
import { MapRenderingOptions, RouteId, VehicleId } from '@app/utils/component-interface';

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
        this.refreshVehicles();
    }

    @Input() set useVehicleClusters(value: boolean) {
        this.options.useVehicleClusters = value;
        this.refreshVehicles();
    }

    @Input() set mergeAllVehicleClusters(value: boolean) {
        this.options.mergeAllVehicleClusters = value;
        this.refreshVehicles();
    }


    @Input() set agencies(values: string[]) {
        this.currentAgencies = values;
        this.refreshVehicles();
    };

    @Input() set routes(routeIds: RouteId[]) {
        if (!routeIds.length) {
            this.clearAllTripShapes();
            this.currentRoutes = new Set();
        }
        else if (routeIds.length > this.currentRoutes.size) {
            this.clearTripShapes();
            this.addSemiTransparentRoutes(routeIds);
        } else if (routeIds.length < this.currentRoutes.size) {
            this.clearTripShapes();
            this.removeSemiTransparentRoutes(routeIds);
        }

        this.refreshVehicles();
    };

    @Input() set vehicle(value: VehicleId | null | undefined) {
        if (!value) this.clearSemiTransparentTripShapes();
    }

    @Output() newVehicleSelected = new EventEmitter<VehicleId>();

    private map!: L.Map;
    private vehicleLayers: L.LayerGroup[] = [];
    private routeLayers: L.LayerGroup[] = [];
    private routeToSemiTransparentLayers = new Map<string, L.LayerGroup>();

    private currentAgencies: string[] = [];
    private currentRoutes = new Set<string>();

    private options: MapRenderingOptions = {
        darkModeEnable: false,
        showOldVehicles: false,
        useVehicleClusters: true,
        mergeAllVehicleClusters: false,
    };

    private readonly emitVehicleSelected = (vehicleId: VehicleId) => {
        this.newVehicleSelected.emit(vehicleId);
    };

    constructor(
        private vehicleMarkerService: VehicleMarkerService,
        private tripShapeService: TripShapeService,
    ) {}

    ngOnInit(): void {
        this.initMap();
        setInterval(() => { 
            this.refreshVehicles();
        }, 30 * ONE_SEC_IN_MS)
    }
    
    private initMap(): void {
        const TomTomTileLayer = L.tileLayer('https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=3GZCUZbHUOBdGhlDtQiCvnBskUWTev4L&tileSize=256&language=fr-FR', {
            attribution: '&copy; <a href="https://tomtom.com" target="_blank">1992 - 2023 TomTom.</a> ',
            subdomains: 'abcd',
        });

        const OSMTileLayer = L.tileLayer('https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        });

        const ArcGISLayer = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        });
        
        this.map = L.map('map', {
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            zoomControl: false,
            preferCanvas: true,
            layers: [TomTomTileLayer]
        }).setView([this.lat, this.lon], this.zoom);

        this.map.invalidateSize({ animate: true });

        const layerControl = L.control.layers({ 'TomTom': TomTomTileLayer }).addTo(this.map);
        layerControl.addBaseLayer(OSMTileLayer, 'OpenStreetMaps');
        layerControl.addBaseLayer(ArcGISLayer, 'ArcGIS Satellite');

        const markerPane = this.map.createPane('marker');
        const shapesPane = this.map.createPane('shapes');
        const semitransparentPane = this.map.createPane('semitransparent');
        markerPane.style.zIndex = '220';
        shapesPane.style.zIndex = '210';
        semitransparentPane.style.zIndex = '205';
        semitransparentPane.style.opacity = '0.5';
    }

    private async clearVehicles(): Promise<void> {
        await this.clearLayers(this.vehicleLayers);
        this.vehicleLayers = [];
    }

    private async clearAllTripShapes(): Promise<void> {
        this.clearTripShapes();
        this.clearSemiTransparentTripShapes();
    }

    private async clearTripShapes(): Promise<void> {
        await this.clearLayers(this.routeLayers);
        this.routeLayers = [];
    }

    private async clearSemiTransparentTripShapes(): Promise<void> {
        this.routeToSemiTransparentLayers.forEach(async (layer) => {
            this.clearLayer(layer);
        });
        this.routeToSemiTransparentLayers = new Map<string, L.LayerGroup>();
    }

    private async clearLayers(layers: L.LayerGroup[]): Promise<void> {
        layers.forEach((layer) => this.clearLayer(layer));
    }

    private async clearLayer(layer: L.LayerGroup): Promise<void> {
        if (layer && this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
        }
    }


    private async refreshVehicles(): Promise<void> {
        await this.clearVehicles();
        if (!this.currentRoutes.size) this.addAllVehicles();
        else this.addAllVehiclesFromRoutes();
    }

    private async addAllVehicles(): Promise<void> {
        if (this.options.mergeAllVehicleClusters) {
            await this.addAllVehiclesLayer(this.currentAgencies)
        } else {
            this.currentAgencies.forEach(async (agencyId) => {
                await this.addAllVehiclesLayer([agencyId]);
            });
        }
    }

    private async addAllVehiclesLayer(agencyIds: string[]): Promise<void> {
        const vehiclesLayer = await this.vehicleMarkerService.createVehiclesLayer(
            agencyIds,
            this.options,
            this.emitVehicleSelected,
        );
        this.vehicleLayers.push(vehiclesLayer);
        vehiclesLayer.addTo(this.map);
        if (!this.options.useVehicleClusters)
            this.map.setZoom(this.map.getZoom());
    }

    private async addAllVehiclesFromRoutes(): Promise<void> {
        if (!this.currentRoutes.size) return;
        const currentRoutesSorted = [...this.currentRoutes]
            .sort((a, b) => a.localeCompare(b));

        if (this.options.mergeAllVehicleClusters) {
            await this.addAllVehiclesFromRoutesLayer(currentRoutesSorted);
        } else {
            let routes: string[] = [];
            let currentAgencyId = currentRoutesSorted[0].split(PARAM_SEPARATOR)[0];

            for (let route of currentRoutesSorted.concat([PARAM_SEPARATOR])) {
                const agencyId = route.split(PARAM_SEPARATOR)[0];
                if (agencyId !== currentAgencyId) {
                    await this.addAllVehiclesFromRoutesLayer(routes);
                    routes = [];
                    currentAgencyId = agencyId;
                }
                routes.push(route);
            }
        }
    }

    private async addAllVehiclesFromRoutesLayer(routes: string[]): Promise<void> {
        const vehiclesLayer = await this.vehicleMarkerService
            .createVehiclesLayerFromRoutes(
                routes,
                this.options,
                this.emitVehicleSelected,
            );
        this.vehicleLayers.push(vehiclesLayer);
        vehiclesLayer.addTo(this.map);
        if (!this.options.useVehicleClusters)
            this.map.setZoom(this.map.getZoom());
    }


    // private async addRoute(
    //     agencyId: string, 
    //     tripDescriptor?: GtfsRealtimeBindings.transit_realtime.ITripDescriptor | null
    // ): Promise<void> {
    //     await this.clearTripShapes();
    //     if (tripDescriptor && tripDescriptor.tripId) {
    //         const trip = await this.tripShapeService.createTripLayer(
    //             agencyId,
    //             tripDescriptor.tripId,
    //             tripDescriptor.routeId,
    //         );
    //         this.routeLayers.push(trip);
    //         this.map.addLayer(trip);
    //     }
    // }

    private async addSemiTransparentRoutes(routeIds: RouteId[]): Promise<void> {
        const addedRoutes = routeIds.filter((routeId) => !this.currentRoutes.has(`${routeId.agencyId}/${routeId.routeId}`));
        addedRoutes.forEach((routeId) => {
            const routeIdString = `${routeId.agencyId}/${routeId.routeId}`;
            this.currentRoutes.add(routeIdString);
            this.addSemiTransparentRoute(routeIdString);
        });
    }

    private async addSemiTransparentRoute(route: string): Promise<void> {
        const tripLayer = await this.tripShapeService.createSemiTransparentTripsLayer([route]);
        this.routeToSemiTransparentLayers.set(route, tripLayer);
        this.map.addLayer(tripLayer);
    }

    private async removeSemiTransparentRoutes(routeIds: RouteId[]): Promise<void> {
        const routesSet = new Set(routeIds.map((routeId) => `${routeId.agencyId}/${routeId.routeId}`));
        const removedRoutes = [...this.currentRoutes].filter((route) => !routesSet.has(route));
        removedRoutes.forEach((removedRoute) => this.removeSemiTransparentRoute(removedRoute));
        this.currentRoutes = routesSet;
    }

    private async removeSemiTransparentRoute(route: string): Promise<void> {
        const tripsLayer = this.routeToSemiTransparentLayers.get(route);
        if (!tripsLayer) return;
        await this.clearLayer(tripsLayer);
        this.routeToSemiTransparentLayers.delete(route);
    }
}
    
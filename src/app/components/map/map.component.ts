import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import L from 'leaflet';
import { VehicleMarkerService } from '@app/services/layer/vehicle-marker.service';
import { MAX_ZOOM, MIN_ZOOM, PARAM_SEPARATOR } from '@app/utils/constants';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { TripShapeService } from '@app/services/layer/trip-shape.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    @Input() lat: number = 45.6;
    @Input() lon: number = -73.75;
    @Input() zoom: number = 12;

    @Input() set mergeAgencies(value: boolean) {
        this.mergeAgenciesOption = value;
        if (!this.currentRoutes.size) this.addAllVehicles();
        else this.addAllVehiclesFromRoutes();
    };

    @Input() set showOldVehicles(value: boolean) {
        this.oldVehiclesOption = value;
        if (!this.currentRoutes.size) this.addAllVehicles();
        else this.addAllVehiclesFromRoutes();
    }

    @Input() set agencies(values: string[]) {
        this.currentAgencies = values;
        if (!this.currentRoutes.size) this.addAllVehicles();
        else this.addAllVehiclesFromRoutes();
    };

    @Input() set routes(values: string[]) {
        if (!values.length) {
            this.addAllVehicles();
            this.clearAllRouteShapes();
            this.currentRoutes = new Set();
        }
        else if (values.length > this.currentRoutes.size) {
            this.addAllVehiclesFromRoutes();
            this.addSecondaryRouteShapes(values);
        } else if (values.length < this.currentRoutes.size) {
            this.addAllVehiclesFromRoutes();
            this.removeSecondaryRouteShapes(values);
        }
    };

    @Output() newVehicleSelected = new EventEmitter<GtfsRealtimeBindings.transit_realtime.IVehiclePosition>();
    @Output() newVehicleSelectedAgencyId = new EventEmitter<string>();

    private map!: L.Map;
    private vehicleLayers: L.LayerGroup[] = [];
    private routeShapeLayers: L.LayerGroup[] = [];
    private routeToSecondaryShapeLayers = new Map<string, L.LayerGroup>();

    private currentAgencies: string[] = [];
    private currentRoutes = new Set<string>();
    private mergeAgenciesOption: boolean = false;
    private oldVehiclesOption: boolean = false;

    private readonly emitVehicleSelected = (
        agencyId: string, 
        vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition
    ) => {
        this.newVehicleSelected.emit(vehicle);
        this.newVehicleSelectedAgencyId.emit(agencyId);
        this.addRouteShape(agencyId, vehicle.trip);
    };

    constructor(
        private vehicleMarkerService: VehicleMarkerService,
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
        
        // L.tileLayer('https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        // }).addTo(this.map);

        // L.tileLayer('https://navigoservprod.stl.laval.qc.ca/FCT/mbtiles-1.php?id=routier_stl_couleur/{z}/{x}/{y}.png', {
        //     attribution: '<a href="https://https://stlaval.ca/">&copy; STL 2023</a>',
        // }).addTo(this.map);

        L.tileLayer('https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=3GZCUZbHUOBdGhlDtQiCvnBskUWTev4L&tileSize=256&language=fr-FR', {
            maxZoom: 22,
            attribution: '<a href="https://tomtom.com" target="_blank">&copy;  1992 - 2023 TomTom.</a> ',
            subdomains: 'abcd',
        }).addTo(this.map);

        this.map.createPane('semitransparent').style.opacity = '0.5';
    }

    private async clearVehicles(): Promise<void> {
        await this.clearLayers(this.vehicleLayers);
        this.vehicleLayers = [];
    }

    private async clearRouteShapes(): Promise<void> {
        await this.clearLayers(this.routeShapeLayers);
        this.routeShapeLayers = [];
    }

    private async clearAllRouteShapes(): Promise<void> {
        await this.clearLayers(this.routeShapeLayers);
        this.routeToSecondaryShapeLayers.forEach(async (layer) => {
            this.clearLayer(layer);
        });
        this.routeShapeLayers = [];
        this.routeToSecondaryShapeLayers = new Map<string, L.LayerGroup>();
    }

    private async clearLayers(layers: L.LayerGroup[]): Promise<void> {
        layers.forEach((layer) => this.clearLayer(layer));
    }

    private async clearLayer(layer: L.LayerGroup): Promise<void> {
        if (layer && this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
        }
    }

    private async addAllVehicles(): Promise<void> {
        await this.clearVehicles();

        if (this.mergeAgenciesOption) {
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
            this.mergeAgenciesOption,
            this.oldVehiclesOption,
            this.emitVehicleSelected,
        );
        this.vehicleLayers.push(vehiclesLayer);
        this.map.addLayer(vehiclesLayer);
    }

    private async addAllVehiclesFromRoutes(): Promise<void> {
        await this.clearVehicles();

        if (!this.currentRoutes.size) return;
        const currentRoutesSorted = [...this.currentRoutes]
            .sort((a, b) => a.localeCompare(b));

        if (this.mergeAgenciesOption) {
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
                this.mergeAgenciesOption,
                this.oldVehiclesOption,
                this.emitVehicleSelected,
            );
        this.vehicleLayers.push(vehiclesLayer);
        this.map.addLayer(vehiclesLayer);
    }

    private async addRouteShape(
        agencyId: string, 
        tripDescriptor?: GtfsRealtimeBindings.transit_realtime.ITripDescriptor | null
    ): Promise<void> {
        await this.clearRouteShapes();
        if (tripDescriptor && tripDescriptor.tripId) {
            const tripShape = await this.tripShapeService.createTripShapeLayer(
                agencyId,
                tripDescriptor.tripId,
                tripDescriptor.routeId,
            );
            this.routeShapeLayers.push(tripShape);
            this.map.addLayer(tripShape);
        }
    }

    private async addSecondaryRouteShapes(routes: string[]): Promise<void> {
        const addedRoutes = routes.filter((route) => !this.currentRoutes.has(route));
        addedRoutes.forEach((addedRoute) =>  this.addSecondaryRouteShape(addedRoute));
        this.currentRoutes = new Set(routes);
    }

    private async addSecondaryRouteShape(route: string): Promise<void> {
        const tripShapes = await this.tripShapeService.createSecondaryTripShapesLayer([route]);
        this.routeToSecondaryShapeLayers.set(route, tripShapes);
        this.map.addLayer(tripShapes);
    }

    private async removeSecondaryRouteShapes(routes: string[]): Promise<void> {
        const routesSet = new Set(routes);
        const removedRoutes = [...this.currentRoutes].filter((route) => !routesSet.has(route));
        removedRoutes.forEach((removedRoute) => this.removeSecondaryRouteShape(removedRoute));
        this.currentRoutes = new Set(routes);
    }

    private async removeSecondaryRouteShape(route: string): Promise<void> {
        const tripShapesLayer = this.routeToSecondaryShapeLayers.get(route);
        if (!tripShapesLayer) return;
        await this.clearLayer(tripShapesLayer);
        this.routeToSecondaryShapeLayers.delete(route);
    }
}
    
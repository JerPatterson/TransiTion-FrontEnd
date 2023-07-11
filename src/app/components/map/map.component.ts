import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import L from 'leaflet';
import { VehicleMarkerService } from '@app/services/layer/vehicle-marker.service';
import { MAX_ZOOM, MIN_ZOOM } from '@app/utils/constants';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

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
        if (!this.currentRoutes.length) this.addAllVehicleMarkers();
        else this.addAllVehicleMarkersFromRoutes();
    };

    @Input() set showOldVehicles(value: boolean) {
        this.oldVehiclesOption = value;
        if (!this.currentRoutes.length) this.addAllVehicleMarkers();
        else this.addAllVehicleMarkersFromRoutes();
    }

    @Input() set agencies(value: string[]) {
        this.currentAgencies = value;
        if (!this.currentRoutes.length) this.addAllVehicleMarkers();
        else this.addAllVehicleMarkersFromRoutes();
    };

    @Input() set routes(value: string[]) {
        this.currentRoutes = value;
        if (!this.currentRoutes.length) this.addAllVehicleMarkers();
        else this.addAllVehicleMarkersFromRoutes();
    };

    @Output() newVehicleSelected = new EventEmitter<GtfsRealtimeBindings.transit_realtime.IVehiclePosition>();
    @Output() newVehicleSelectedAgencyId = new EventEmitter<string>();

    private map!: L.Map;
    private vehicleLayers: L.LayerGroup[] = [];

    private currentAgencies: string[] = [];
    private currentRoutes: string[] = [];
    private mergeAgenciesOption: boolean = false;
    private oldVehiclesOption: boolean = false;

    private readonly emitVehicleSelected = (
        agencyId: string, 
        vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition
    ) => {
        this.newVehicleSelected.emit(vehicle);
        this.newVehicleSelectedAgencyId.emit(agencyId);
    };

    constructor(
        private vehicleMarkerService: VehicleMarkerService,
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
    }

    private async clearLayers(layers: L.LayerGroup[]) {
        layers.forEach((layer) => this.clearLayer(layer));
    }

    private async clearLayer(layer: L.LayerGroup) {
        if (layer && this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
        }
    }

    private async addAllVehicleMarkers(): Promise<void> {
        await this.clearLayers(this.vehicleLayers);
        this.vehicleLayers = [];

        if (this.mergeAgenciesOption) {
            const vehiclesLayer = await this.vehicleMarkerService.createVehiclesLayer(
                this.currentAgencies,
                this.mergeAgenciesOption,
                this.oldVehiclesOption,
                this.emitVehicleSelected,
            );
            this.vehicleLayers.push(vehiclesLayer);
            this.map.addLayer(vehiclesLayer);
        } else {
            this.currentAgencies.forEach(async (agencyId) => {
                const vehiclesLayer = await this.vehicleMarkerService.createVehiclesLayer(
                    [agencyId],
                    this.mergeAgenciesOption,
                    this.oldVehiclesOption,
                    this.emitVehicleSelected,
                );
                this.vehicleLayers.push(vehiclesLayer);
                this.map.addLayer(vehiclesLayer);
            });
        }
    }

    private async addAllVehicleMarkersFromRoutes(): Promise<void> {
        await this.clearLayers(this.vehicleLayers);
        this.vehicleLayers = [];

        if (this.mergeAgenciesOption) {
            const vehiclesLayer = await this.vehicleMarkerService.createVehiclesLayerFromRoutes(
                this.currentRoutes,
                this.mergeAgenciesOption,
                this.oldVehiclesOption,
                this.emitVehicleSelected,
            );
            this.vehicleLayers.push(vehiclesLayer);
            this.map.addLayer(vehiclesLayer);
        } else {
            this.currentRoutes = this.currentRoutes.sort((a, b) => a.localeCompare(b));

            let routeIds: string[] = [];
            let currentAgencyId = this.currentRoutes.length ? 
                this.currentRoutes[0].split('/')[0] : '';

            for (let value of this.currentRoutes.concat(['/'])) {
                const agencyId = value.split('/')[0];
                const routeId = value.split('/')[1];
                if (agencyId !== currentAgencyId) {
                    const vehiclesLayer = await this.vehicleMarkerService
                        .createVehiclesLayerFromRouteOfUniqueAgency(
                            currentAgencyId.toLowerCase(),
                            routeIds,
                            this.mergeAgenciesOption,
                            this.oldVehiclesOption,
                            this.emitVehicleSelected,
                        );
                    this.vehicleLayers.push(vehiclesLayer);
                    this.map.addLayer(vehiclesLayer);
                    routeIds = [];
                    routeIds.push(routeId);
                    currentAgencyId = agencyId;
                } else {
                    routeIds.push(routeId);
                }
            }
        }
    }
}
    
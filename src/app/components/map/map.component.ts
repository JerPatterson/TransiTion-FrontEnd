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

    private currentAgencies: string[] = [];
    private mergeAgenciesOption: boolean = false;

    @Input() lat: number = 45.6;
    @Input() lon: number = -73.75;
    @Input() zoom: number = 12;

    @Input() set mergeAgencies(value: boolean) {
        this.mergeAgenciesOption = value;
        this.addAllVehicleMarkers();
    };

    @Input() set agencies(value: string[]) {
        this.currentAgencies = value;
        this.addAllVehicleMarkers();
    };

    @Output() newVehicleSelected = new EventEmitter<GtfsRealtimeBindings.transit_realtime.IVehiclePosition>();
    @Output() newVehicleSelectedAgencyId = new EventEmitter<string>();

    private map!: L.Map;
    private vehicleLayers: L.LayerGroup[] = [];

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
        
        L.tileLayer('https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this.map);

        // L.tileLayer('https://navigoservprod.stl.laval.qc.ca/FCT/mbtiles-1.php?id=routier_stl_couleur/{z}/{x}/{y}.png', {
        //     attribution: '<a href="https://https://stlaval.ca/">&copy; STL 2023</a>',
        // }).addTo(this.map);

        // L.tileLayer('https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=3GZCUZbHUOBdGhlDtQiCvnBskUWTev4L&tileSize=256&language=fr-FR', {
        //     maxZoom: 22,
        //     attribution: '<a href="https://tomtom.com" target="_blank">&copy;  1992 - 2023 TomTom.</a> ',
        //     subdomains: 'abcd',
        // }).addTo(this.map);
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

        const emitVehicleSelected = (
            agencyId: string, 
            vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition
        ) => {
            this.newVehicleSelected.emit(vehicle);
            this.newVehicleSelectedAgencyId.emit(agencyId);
        };

        if (this.mergeAgenciesOption) {
            const vehiclesLayer = await this.vehicleMarkerService.createVehiclesLayer(
                this.currentAgencies,
                !this.mergeAgenciesOption,
                emitVehicleSelected,
            );
            this.vehicleLayers.push(vehiclesLayer);
            this.map.addLayer(vehiclesLayer);
        } else {
            this.currentAgencies.forEach(async (agencyId) => {
                const vehiclesLayer = await this.vehicleMarkerService.createVehiclesLayer(
                    [agencyId],
                    !this.mergeAgenciesOption,
                    emitVehicleSelected,
                );
                this.vehicleLayers.push(vehiclesLayer);
                this.map.addLayer(vehiclesLayer);
            })
        }
    }
}
    
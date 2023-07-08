import { Component, Input, OnInit } from '@angular/core';
import L from 'leaflet';
// import { TripShapeService } from '@app/services/layer/trip-shape.service';
// import { StopMarkerService } from '@app/services/layer/stop-marker.service';
import { VehicleMarkerService } from '@app/services/layer/vehicle-marker.service';
import { MAX_ZOOM, MIN_ZOOM } from '@app/utils/constants';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    // private readonly zoomLevelThatHideStops = 16;

    private currentAgencies: string[] = [];
    private mergeAgenciesOption: boolean = false;

    // private currentStopId: string = '';
    // private currentRouteId: string = '';

    @Input() lat: number = 45.6;
    @Input() lon: number = -73.75;
    @Input() zoom: number = 12;

    @Input() set agencies(value: string[]) {
        this.currentAgencies = value;
        this.addAllVehicleMarkers();
    };

    @Input() set mergeAgencies(value: boolean) {
        this.mergeAgenciesOption = value;
        this.addAllVehicleMarkers();
    };

    // @Input() set routeId(value: string) {
    //     this.currentRouteId = value;
    //     if (value) {
    //         this.addVehicleMarkers(value);
    //     }
    // };

    // @Input() set stopId(value: string) {
    //     this.currentStopId = value;
    //     this.addCurrentStopMarker();
    //     if (value && !this.currentRouteId) {
    //         this.addSecondaryTripsShape(value);
    //     }
    // }

    // @Input() set tripId(value: string) {
    //     if (value) {
    //         this.addTripShape(value);
    //         this.addStopMarkers(value);
    //     }
    // };

    private map!: L.Map;
    private vehicleLayers: L.LayerGroup[] = [];

    // private stopLayer!: L.LayerGroup;
    // private currentStopLayer!: L.LayerGroup;
    // private tripLayer!: L.LayerGroup;
    // private secondaryTripLayer!: L.LayerGroup;

    constructor(
        // private tripShapeService: TripShapeService,
        // private stopMarkerService: StopMarkerService,
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

    private async clearLayer(layer: L.LayerGroup) {
        if (layer && this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
        }
    }

    private async clearLayers(layers: L.LayerGroup[]) {
        layers.forEach(async (layer) => await this.clearLayer(layer));
    }

    private async addAllVehicleMarkers(): Promise<void> {
        await this.clearLayers(this.vehicleLayers);
        this.vehicleLayers = [];

        if (this.mergeAgenciesOption) {
            const vehiclesLayer = await this.vehicleMarkerService.createVehiclesLayer(this.currentAgencies, !this.mergeAgenciesOption);
            this.vehicleLayers.push(vehiclesLayer);
            this.map.addLayer(vehiclesLayer);
        } else {
            this.currentAgencies.forEach(async (agencyId) => {
                const vehiclesLayer = await this.vehicleMarkerService.createVehiclesLayer([agencyId], !this.mergeAgenciesOption);
                this.vehicleLayers.push(vehiclesLayer);
                this.map.addLayer(vehiclesLayer);
            })
        }
    }

    // private async addVehicleMarkers(routeId: string): Promise<void> {
    //     this.clearLayer(this.vehicleLayer);
    //     this.vehicleLayer = await this.vehicleMarkerService.createVehiclesLayer(this.currentAgencies, routeId);
    //     this.map.addLayer(this.vehicleLayer);
    // }

    // private async addTripShape(tripId: string): Promise<void> {
    //     this.clearLayer(this.tripLayer);
    //     this.tripLayer = await this.tripShapeService.createTripShapeLayer(this.currentAgencies, tripId, '#0a2196');
    //     this.map.addLayer(this.tripLayer);
    // }

    // private async addSecondaryTripsShape(stopId: string): Promise<void> {
    //     this.clearLayer(this.secondaryTripLayer);
    //     this.secondaryTripLayer = await this.tripShapeService.createSecondaryTripShapeLayer(this.currentAgencies, stopId, '#0a2196');
    //     if (this.secondaryTripLayer) this.map.addLayer(this.secondaryTripLayer);
    //     this.map.createPane('semitransparent').style.opacity = '0.5';
    // }

    // private async addCurrentStopMarker(): Promise<void> {
    //     this.clearLayer(this.currentStopLayer);
    //     this.currentStopLayer = await this.stopMarkerService.createCurrentStopLayer(this.currentAgencies, this.currentStopId);
    //     this.map.addLayer(this.currentStopLayer);
    // }

    // private async addStopMarkers(tripId: string): Promise<void> {
    //     this.clearLayer(this.stopLayer);
    //     if (this.stopLayer && this.map.hasLayer(this.stopLayer)) {
    //         this.map.removeLayer(this.stopLayer);
    //     }

    //     this.stopLayer = await this.stopMarkerService.createOtherStopsLayer(this.currentAgencies, tripId, this.currentStopId);
    //     if (this.map.getZoom() > this.zoomLevelThatHideStops) this.map.addLayer(this.stopLayer);

    //     this.map.addEventListener('zoomend', () => {
    //         if (this.map.getZoom() <= this.zoomLevelThatHideStops) {
    //             this.map.removeLayer(this.stopLayer);
    //         } else if (!this.map.hasLayer(this.stopLayer)) {
    //             this.map.addLayer(this.stopLayer);
    //         }
    //     });
    // }
}
    
import { Component, Input, OnInit } from '@angular/core';
import L from 'leaflet';
import { TripShapeService } from '@app/services/layer/trip-shape.service';
import { StopMarkerService } from '@app/services/layer/stop-marker.service';
import { VehicleMarkerService } from '@app/services/layer/vehicle-marker.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    private readonly stopsLoadingDelay = 4000;
    private readonly zoomLevelThatHideStops = 16;

    private currentAgencyId: string = '';
    private currentStopId: string = '';
    private currentRouteId: string = '';

    @Input() lat: number = 45.6;
    @Input() lon: number = -73.75;
    @Input() zoom: number = 12;

    @Input() set agencyId(value: string) {
        this.currentAgencyId = value;
        this.clearAllLayer();
    };

    @Input() set routeId(value: string) {
        this.currentRouteId = value;
        if (value) {
            this.addVehicleMarkers(value);
        }
    };

    @Input() set stopId(value: string) {
        this.currentStopId = value;
        if (value && !this.currentRouteId) {
            this.addSecondaryTripsShape(value);
        }
    }

    @Input() set tripId(value: string) {
        if (value) {
            this.addTripShape(value);
            this.addStopMarkers(value);
        }
    };

    private map!: L.Map;
    private stopLayer!: L.LayerGroup;
    private currentStopLayer!: L.LayerGroup;
    private vehicleLayer!: L.LayerGroup;
    private tripLayer!: L.LayerGroup;
    private secondaryTripLayer!: L.LayerGroup;

    constructor(
        private tripShapeService: TripShapeService,
        private stopMarkerService: StopMarkerService,
        private vehicleMarkerService: VehicleMarkerService,
    ) {}

    ngOnInit(): void {
        this.initMap();
        // if (!this.stopId) setTimeout(() => this.addAllVehicleMarkers(), 1000);
    }
    
    private initMap(): void {
        this.map = L.map('map', {
            minZoom: 8,
            maxZoom: 18,
            zoomControl: false,
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

    private async clearAllLayer() {
        this.clearLayer(this.stopLayer);
        this.clearLayer(this.currentStopLayer);
        this.clearLayer(this.vehicleLayer);
        this.clearLayer(this.tripLayer);
        this.clearLayer(this.secondaryTripLayer);
    }

    private async clearLayer(layer: L.LayerGroup) {
        if (layer && this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
        }
    }

    // private async addAllVehicleMarkers(): Promise<void> {
    //     if (this.vehicleLayer) this.map.removeLayer(this.vehicleLayer);
    //     this.vehicleLayer = await this.vehicleMarkerService.createAllVehiclesLayer(this.currentAgencyId);
    //     this.map.addLayer(this.vehicleLayer);
    // }

    private async addVehicleMarkers(routeId: string): Promise<void> {
        this.clearLayer(this.vehicleLayer);
        this.vehicleLayer = await this.vehicleMarkerService.createVehiclesLayer(this.currentAgencyId, routeId);
        this.map.addLayer(this.vehicleLayer);
    }

    private async addTripShape(tripId: string): Promise<void> {
        this.clearLayer(this.tripLayer);
        this.tripLayer = await this.tripShapeService.createTripShapeLayer(this.currentAgencyId, tripId, '#0a2196');
        this.map.addLayer(this.tripLayer);
    }

    private async addSecondaryTripsShape(stopId: string): Promise<void> {
        this.clearLayer(this.secondaryTripLayer);
        this.secondaryTripLayer = await this.tripShapeService.createSecondaryTripShapeLayer(this.currentAgencyId, stopId, '#0a2196');
        if (this.secondaryTripLayer) this.map.addLayer(this.secondaryTripLayer);
        this.map.createPane('semitransparent').style.opacity = '0.5';
    }

    private async addStopMarkers(tripId: string): Promise<void> {
        this.addCurrentStopMarker();
        setTimeout(() => this.addOtherStopMarkers(tripId), this.stopsLoadingDelay);
    }

    private async addCurrentStopMarker(): Promise<void> {
        this.clearLayer(this.currentStopLayer);
        this.currentStopLayer = await this.stopMarkerService.createCurrentStopLayer(this.currentAgencyId, this.currentStopId);
        this.map.addLayer(this.currentStopLayer);
    }

    private async addOtherStopMarkers(tripId: string): Promise<void> {
        this.clearLayer(this.stopLayer);
        if (this.stopLayer && this.map.hasLayer(this.stopLayer)) {
            this.map.removeLayer(this.stopLayer);
        }

        this.stopLayer = await this.stopMarkerService.createOtherStopsLayer(this.currentAgencyId, tripId, this.currentStopId);
        if (this.map.getZoom() > this.zoomLevelThatHideStops) this.map.addLayer(this.stopLayer);

        this.map.addEventListener('zoomend', () => {
            if (this.map.getZoom() <= this.zoomLevelThatHideStops) {
                this.map.removeLayer(this.stopLayer);
            } else if (!this.map.hasLayer(this.stopLayer)) {
                this.map.addLayer(this.stopLayer);
            }
        });
    }
}
    
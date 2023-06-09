import { Component, Input, OnInit } from '@angular/core';
import { Vehicle } from '@app/interfaces/vehicle';
import { Stop } from '@app/interfaces/gtfs';
import { RealtimeDataService } from '@app/services/realtime/realtime-data.service';
import { StaticStopDataService } from '@app/services/static/static-stop-data.service';
import L from 'leaflet';
import { TripShapeService } from '@app/services/layer/trip-shape.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    private readonly zoomLevelThatHideStops = 15;

    @Input() lat: number = 45.6;
    @Input() lon: number = -73.75;
    @Input() zoom: number = 12;

    @Input() agencyId: string = '';

    @Input() stopId: string = '';
    @Input() set routeId(value: string) {
        if (value) this.addStops(value);
    };
    @Input() set tripId(value: string) {
        if (value) this.addTripShape(value);
    };
    @Input() set tripIds(value: string[]) {
        if (value) this.addSecondaryTripsShape(value);
    };

    private map!: L.Map;
    private stopLayer!: L.LayerGroup;
    private vehicleLayer!: L.LayerGroup;
    private tripShapeLayer!: L.LayerGroup;

    constructor(
        private stStopDataService: StaticStopDataService,
        private rtDataService: RealtimeDataService,
        private tripShapeService: TripShapeService,
    ) {}

    ngOnInit(): void {
        this.initMap();
        if (!this.stopId) setTimeout(() => this.addVehicles(), 1000);
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

    private async addStops(routeIdValue: string): Promise<void> {
        const stopMarkers = L.layerGroup();
        (await this.stStopDataService.getStopsFromRoute(this.agencyId, routeIdValue)).forEach(async stop => {
            if (stop.id !== this.stopId) stopMarkers.addLayer(await this.buildStopMarker(stop));
            else this.map.addLayer(await this.buildCurrentStopMarker(stop));
        });

        if (this.stopLayer && this.map.hasLayer(this.stopLayer))
            this.map.removeLayer(this.stopLayer);
        this.stopLayer = L.layerGroup().addLayer(stopMarkers);
        if (this.map.getZoom() > this.zoomLevelThatHideStops) this.map.addLayer(this.stopLayer);

        this.map.addEventListener('zoomend', () => {
            if (this.map.getZoom() <= this.zoomLevelThatHideStops) {
                this.map.removeLayer(this.stopLayer);
            } else if (!this.map.hasLayer(this.stopLayer)) {
                this.map.addLayer(this.stopLayer);
            }
        })
    }

    private async buildCurrentStopMarker(stop: Stop): Promise<L.Marker> {
        const marker = L.marker([stop.location.lat, stop.location.lon], {
            icon: L.icon({
                iconUrl: stop.hasShelter ? './assets/icons/stop-selected.png' : './assets/icons/stop-sign-selected.png',
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25],
            }),
        });

        return marker.bindPopup(`${stop.name} [${stop.id}]`);
    }

    private async buildStopMarker(stop: Stop): Promise<L.Marker> {
        const marker = L.marker([stop.location.lat, stop.location.lon], {
            icon: L.icon({
                iconUrl: stop.hasShelter ? './assets/icons/stop.png' : './assets/icons/stop-sign.png',
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25],
            }),
        });
        return marker.bindPopup(`${stop.name} [${stop.id}]`);
    }

    private async addVehicles(): Promise<void> {
        const vehicleMarkers = L.layerGroup();
        (await this.rtDataService.getVehiclesFromAgency(this.agencyId)).forEach(async vehicle => {
            vehicleMarkers.addLayer(await this.buildVehicleMarker(vehicle));
        });

        this.vehicleLayer = L.layerGroup().addLayer(vehicleMarkers);
        this.map.addLayer(this.vehicleLayer);
    }

    private async buildVehicleMarker(vehicle: Vehicle): Promise<L.Marker> {
        const marker = L.marker([vehicle.location.lat, vehicle.location.lon], {
            icon: L.icon({
                iconUrl: './assets/icons/bus.png',
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25],
            }),
        });
        return marker.bindPopup(`${vehicle.id}`);
    }

    private async addTripShape(tripId: string): Promise<void> {
        const shapeLayer = await this.tripShapeService.createTripShapeLayer(this.agencyId, tripId, '#0a2196');
        if (this.tripShapeLayer && this.map.hasLayer(this.tripShapeLayer))
            this.map.removeLayer(this.tripShapeLayer);
        this.tripShapeLayer = shapeLayer;
        this.map.addLayer(this.tripShapeLayer);
    }

    private async addSecondaryTripsShape(tripIds: string[]): Promise<void> {
        const layer = await this.tripShapeService.createSecondaryTripShapeLayer(this.agencyId, tripIds, '#0a2196')
        if (layer) this.map.addLayer(layer);
        const pane = this.map.createPane('semitransparent');
        pane.style.opacity = '0.5';
    }
}
    
import { Component, Input, OnInit } from '@angular/core';
import { StaticStopDataService } from '@app/services/static/static-stop-data.service';
import { StaticTripDataService } from '@app/services/static/static-trip-data.service';
import L from 'leaflet';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    private readonly zoomLevelThatHideStops = 14;

    @Input() lat: number = 45.6;
    @Input() lon: number = -73.75;
    @Input() zoom: number = 12;

    @Input() agencyId: string = '';
    @Input() set routeId(value: string) {
        if (value) this.addStops(value);
    };
    @Input() set shapeId(value: string) {
        if (value) this.addTripShape(value);
    };

    private map!: L.Map;
    private stopLayer!: L.LayerGroup;
    private tripShapeLayer!: L.LayerGroup;

    constructor(
        private stStopDataService: StaticStopDataService,
        private stTripDataService: StaticTripDataService,
    ) {}

    ngOnInit(): void {
        this.initMap();
    }
    
    private initMap(): void {
        this.map = L.map('map', {
            minZoom: 6,
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
        (await this.stStopDataService.getStopsFromRoute(this.agencyId, routeIdValue)).forEach(stop => {
            const marker = L.marker([stop.location.lat, stop.location.lon], {
                icon: L.icon({
                    iconUrl: stop.hasShelter ? './assets/icons/stop.png' : './assets/icons/stop-sign.png',
                    iconSize: [50, 50],
                    iconAnchor: [25, 25],
                    popupAnchor: [0, -25],
                }),
            });
            stopMarkers.addLayer(marker.bindPopup(stop.id + ' ' + stop.name));
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

    private async addTripShape(shapeIdValue: string): Promise<void> {
        const pointList: L.LatLng[] = [];
        (await this.stTripDataService.getShapeOfTrip(this.agencyId, shapeIdValue)).forEach(shapePt =>
            pointList.push(L.latLng(shapePt.location.lat, shapePt.location.lon))
        );
        const tripShape = new L.Polyline(pointList, {
            color: 'red',
            weight: 8,
            opacity: 0.5,
            smoothFactor: 1,
        });

        if (this.tripShapeLayer && this.map.hasLayer(this.tripShapeLayer))
            this.map.removeLayer(this.tripShapeLayer);
        this.tripShapeLayer = L.layerGroup().addLayer(tripShape);
        this.map.addLayer(this.tripShapeLayer);
    }
}
    
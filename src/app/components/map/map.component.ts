import { Component, Input, OnInit } from '@angular/core';
import { StaticDataService } from '@app/services/static-data.service';
import L from 'leaflet';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    @Input() lat: number = 45.6;
    @Input() lon: number = -73.75;
    @Input() zoom: number = 12;

    @Input() agencyId: string = '';
    @Input() routeId: string = '';
    @Input() tripId: string = '';

    private map!: L.Map;
    private stopLayer!: L.LayerGroup;

    constructor(private stDataService: StaticDataService) {}

    ngOnInit(): void {
        this.initMap();
        this.addStops();
        this.addTripShape();
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

    private async addStops(): Promise<void> {
        this.stopLayer = L.layerGroup();
        (await this.stDataService.getStopsFromRoute(this.agencyId, this.routeId)).forEach(stop => {
            const marker = L.marker([stop.location.lat, stop.location.lon], {
                icon: L.icon({
                    iconUrl: stop.hasShelter ? './assets/icons/stop.png' : './assets/icons/stop-sign.png',
                    iconSize: [50, 50],
                    iconAnchor: [25, 25],
                    popupAnchor: [0, -25],
                }),
            });
            this.stopLayer.addLayer(marker.bindPopup(stop.id + ' ' + stop.name));
        });

        this.map.addEventListener('zoomend', () => {
            const currentZoomLevel = this.map.getZoom();
            if (currentZoomLevel <= 14) {
                this.map.removeLayer(this.stopLayer);
            } else if (!this.map.hasLayer(this.stopLayer)) {
                this.map.addLayer(this.stopLayer);
            }
        })
    }

    private async addTripShape(): Promise<void> {
        const pointList: L.LatLng[] = [];
        (await this.stDataService.getShapeOfTrip(this.agencyId, '42O2')).forEach(shapePt =>
            pointList.push(L.latLng(shapePt.location.lat, shapePt.location.lon))
        );
        const tripShape = new L.Polyline(pointList, {
            color: 'red',
            weight: 8,
            opacity: 0.5,
            smoothFactor: 1,
        });
        tripShape.addTo(this.map);
    }
}
    
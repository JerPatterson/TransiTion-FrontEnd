import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { rtRouteConfig, rtStop } from 'src/app/interfaces/real-time-communications';
import { RealTimeDataService } from 'src/app/services/real-time-data.service';
import { CANVAS_WIDTH, CANVAS_PADDING, STOP_SIZE } from 'src/app/constants/canvas';

@Component({
    selector: 'app-route-infography',
    templateUrl: './route-infography.component.html',
    styleUrls: ['./route-infography.component.css']
})
export class RouteInfographyComponent implements OnChanges {
    @Input() routeTag: string;
    @ViewChild('RouteCanvas', { static: false }) routeCanvas!: ElementRef<HTMLCanvasElement>;

    private stops: rtStop[];
    private routeConfig: rtRouteConfig;

    constructor(private readonly rtDataService: RealTimeDataService) {
        this.routeTag = '';
        this.stops = [];
        this.routeConfig = {} as rtRouteConfig;
    }

    async ngOnChanges() {
        this.routeConfig = await this.rtDataService.getRouteConfig(this.routeTag);
        this.setCanvasDimensions();
        this.stops = await this.rtDataService.getStopList(this.routeTag);
        this.addStops();
    }

    private setCanvasDimensions() {
        this.routeCanvas.nativeElement.width = CANVAS_WIDTH;
        const contentWidth = CANVAS_WIDTH - 2 * CANVAS_PADDING;
        this.routeCanvas.nativeElement.height = this.getLatitudeInterval() * contentWidth / this.getLongitudeInterval();
    }

    private addStops() {
        const context = this.routeCanvas.nativeElement.getContext('2d');
        this.stops.forEach((stop) => {
            if (!context) return;
            context.fillStyle = '#000000'
            context.fillRect(
                this.getLongitudeCanvasPosition(stop),
                this.getLatitudeCanvasPosition(stop),
                STOP_SIZE,
                STOP_SIZE,
            )
        });
    }

    private getLongitudeCanvasPosition(stop: rtStop): number {
        const contentWidth = this.routeCanvas.nativeElement.width - 2 * CANVAS_PADDING;
        return CANVAS_PADDING + (stop.longitude - this.routeConfig.longitudeMin) / this.getLongitudeInterval() * contentWidth;
    }

    private getLatitudeCanvasPosition(stop: rtStop): number {
        const contentHeight = this.routeCanvas.nativeElement.height - 2 * CANVAS_PADDING;
        return CANVAS_PADDING + (this.routeConfig.latitudeMax - stop.latitude) / this.getLatitudeInterval() * contentHeight;
    }

    private getLongitudeInterval(): number {
        return this.routeConfig.longitudeMax - this.routeConfig.longitudeMin;
    }

    private getLatitudeInterval(): number {
        return this.routeConfig.latitudeMax - this.routeConfig.latitudeMin;
    }
}

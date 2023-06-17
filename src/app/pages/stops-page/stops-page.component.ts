import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StopDto } from '@app/utils/dtos';

@Component({
    selector: 'app-stops-page',
    templateUrl: './stops-page.component.html',
    styleUrls: ['./stops-page.component.css']
})
export class StopsPageComponent implements OnInit {
    stops: StopDto[] = [];

    @Output() newStopId = new EventEmitter<string>();

    @Input() set agencyId(value: string) {
        if (value !== this.currentAgencyId) {
            this.currentAgencyId = value;
        }
    };

    @Input() set routeId(value: string) {
        if (value !== this.currentRouteId) {
            this.currentRouteId = value;
        }
    };

    private currentAgencyId: string = '';
    private currentRouteId: string = '';
    
    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setStops();
    }

    onClick(stopId: string) {
        this.newStopId.emit(stopId);
    }
    
    private async setStops() {
        console.log('Here', this.currentAgencyId, this.currentRouteId);
        if (this.currentAgencyId && this.currentRouteId) {
            this.stops = await this.staticDataService.getStopsFromRoute(this.currentAgencyId, this.currentRouteId);
        } else if (this.currentAgencyId && !this.currentRouteId) {
            this.stops = await this.staticDataService.getStopsFromAgency(this.currentAgencyId);
        }
    }
}

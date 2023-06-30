import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StopLocationDto } from '@app/utils/dtos';

@Component({
    selector: 'app-stop-list',
    templateUrl: './stop-list.component.html',
    styleUrls: ['./stop-list.component.css']
})
export class StopListComponent implements OnInit {
    stops: StopLocationDto[] = [];

    @Input() agencyId: string = '';
    @Input() routeId: string = '';
    @Input() stopId: string = '';
    @Output() newStopId = new EventEmitter<string>();
    
    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setStops();
    }

    onClick(stopId: string) {
        this.newStopId.emit(stopId);
    }
    
    private async setStops() {
        if (this.agencyId && this.routeId) {
            this.stops = await this.staticDataService.getStopsFromRoute(this.agencyId, this.routeId);
        } else if (this.agencyId && !this.routeId) {
            this.stops = await this.staticDataService.getStopLocationsFromAgency(this.agencyId);
        }
    }
}

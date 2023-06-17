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

    @Input() agencyId: string = '';
    @Input() routeId: string = '';
    @Output() newStopId = new EventEmitter<string>();
    
    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setStops();
    }

    onClick(stopId: string) {
        this.newStopId.emit(stopId);
    }
    
    private async setStops() {
        console.log('Here', this.agencyId, this.routeId);
        if (this.agencyId && this.routeId) {
            this.stops = await this.staticDataService.getStopsFromRoute(this.agencyId, this.routeId);
        } else if (this.agencyId && !this.routeId) {
            this.stops = await this.staticDataService.getStopsFromAgency(this.agencyId);
        }
    }
}

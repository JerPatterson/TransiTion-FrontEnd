import { Component, Input } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StopDto } from '@app/utils/dtos';

@Component({
    selector: 'app-stops-page',
    templateUrl: './stops-page.component.html',
    styleUrls: ['./stops-page.component.css']
})
export class StopsPageComponent {
    stops: StopDto[] = [];

    @Input() set agencyId(value: string) {
        if (value !== this.currentAgencyId) {
            this.currentAgencyId = value;
            this.setStops();
        }
    };

    @Input() set routeId(value: string) {
        if (value !== this.currentRouteId) {
            this.currentRouteId = value;
            this.setStops();
        }
    };

    private currentAgencyId: string = '';
    private currentRouteId: string = '';
    
    constructor(private staticDataService: StaticDataService) {}
    
    private async setStops() {
        if (this.currentAgencyId && this.currentRouteId) {
            this.stops = await this.staticDataService.getStopsFromRoute(this.currentAgencyId, this.currentRouteId);
        } else if (this.currentAgencyId) {
            this.stops = await this.staticDataService.getStopsFromAgency(this.currentAgencyId);
        }
    }
}

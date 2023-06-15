import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StopDto } from '@app/utils/dtos';

@Component({
    selector: 'app-stops-page',
    templateUrl: './stops-page.component.html',
    styleUrls: ['./stops-page.component.css']
})
export class StopsPageComponent {
    stops: StopDto[] = [];
    agencyId: string | undefined;
    routeId: string | undefined;
    
    constructor(private route: ActivatedRoute, private staticDataService: StaticDataService) {
        this.setStops();
    }
    
    private async setStops() {
        const agencyId = this.route.snapshot.paramMap.get('agency-name');
        if (!agencyId) return;
        this.agencyId = agencyId;

        const routeId = this.route.snapshot.paramMap.get('route-id');
        if (!routeId) {
            this.stops = await this.staticDataService.getStopsFromAgency(agencyId);
            return;
        }
        this.routeId = routeId;
        this.stops = await this.staticDataService.getStopsFromRoute(agencyId, routeId);
    }
}

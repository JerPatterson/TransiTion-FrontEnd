import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Stop } from '@app/interfaces/concepts';
import { StaticStopDataService } from '@app/services/static-stop-data.service';

@Component({
    selector: 'app-stops-page',
    templateUrl: './stops-page.component.html',
    styleUrls: ['./stops-page.component.css']
})
export class StopsPageComponent {
    stops: Stop[] = [];
    agencyId: string | undefined;
    routeId: string | undefined;
    
    constructor(private route: ActivatedRoute, private stStopDataService: StaticStopDataService) {
        this.setStops();
    }
    
    private async setStops() {
        const agencyId = this.route.snapshot.paramMap.get('agency-name');
        if (!agencyId) return;
        this.agencyId = agencyId;

        const routeId = this.route.snapshot.paramMap.get('route-id');
        if (!routeId) {
            this.stops = await this.stStopDataService.getStopsFromAgency(agencyId);
            return;
        }
        this.routeId = routeId;
        this.stops = await this.stStopDataService.getStopsFromRoute(agencyId, routeId);
    }
}

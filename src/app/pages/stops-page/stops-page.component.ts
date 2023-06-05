import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Stop } from '@app/interfaces/concepts';
import { StaticDataService } from '@app/services/static-data.service';

@Component({
    selector: 'app-stops-page',
    templateUrl: './stops-page.component.html',
    styleUrls: ['./stops-page.component.css']
})
export class StopsPageComponent {
    stops: Stop[] = [];

    agencyId: string | undefined;
    routeId: string | undefined;
    
    constructor(private route: ActivatedRoute, private stDataService: StaticDataService) {
        this.setStops();
    }
    
    private async setStops() {
        const agencyId = this.route.snapshot.paramMap.get('agency-name');
        const routeId = this.route.snapshot.paramMap.get('route-id');

        if (!agencyId) return;
        this.agencyId = agencyId;
        const stops = await this.stDataService.getStopsFromAgency(agencyId);

        if (!stops || !routeId) return;
        this.routeId = routeId;
        this.stops = routeId ? stops.filter(r => r.routeIds.includes(routeId)) : stops;
    }
}

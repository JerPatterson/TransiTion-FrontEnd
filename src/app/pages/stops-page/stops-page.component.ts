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
    
    constructor(private route: ActivatedRoute, private stDataService: StaticDataService) {
        this.setStops();
    }
    
    private async setStops() {
        const agency = this.route.snapshot.paramMap.get('agency-name');
        const routeId = this.route.snapshot.paramMap.get('route-id');

        if (!agency) return;
        const stops = await this.stDataService.getStopsFromAgency(agency);

        if (!stops) return;
        this.stops = routeId ? stops.filter(r => r.routeIds.includes(routeId)) : stops;
    }
}

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Stop } from '@app/interfaces/concepts';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-stops-page',
    templateUrl: './stops-page.component.html',
    styleUrls: ['./stops-page.component.css']
})
export class StopsPageComponent {
    stops: Stop[] = [];
    
    constructor(private route: ActivatedRoute, private communication: CommunicationService) {
        this.setStops();
    }
    
    private async setStops() {
        const agency = this.route.snapshot.paramMap.get('agency-name');
        const routeId = this.route.snapshot.paramMap.get('route-id');

        if (!agency) return;
        const stops = (await this.communication.getStopsFromAgency(agency)).data()?.arr;

        if (!stops) return;
        this.stops = routeId ? (stops as Stop[]).filter(r => r.routeIds.includes(routeId)) : stops;
    }
}

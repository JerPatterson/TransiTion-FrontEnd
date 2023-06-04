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
    agency: string | null;
    stops: Stop[] = [];
    
    constructor(private route: ActivatedRoute, private communication: CommunicationService) {
        this.agency = this.route.snapshot.paramMap.get('agency-name');
        this.setStops();
    }
    
    private async setStops() {
        if (!this.agency) return;
        this.stops = ((await this.communication.getStopsFromAgency(this.agency))
            .data()?.arr as Stop[])
            .sort((a, b) => a.id.length - b.id.length);
    }
}

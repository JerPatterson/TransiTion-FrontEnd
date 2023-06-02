import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@app/interfaces/concepts';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-routes-page',
    templateUrl: './routes-page.component.html',
    styleUrls: ['./routes-page.component.css']
})
export class RoutesPageComponent {
    agency: string | null;
    routes: Route[] = [];

    constructor(private route: ActivatedRoute, private communication: CommunicationService) {
        this.agency = this.route.snapshot.paramMap.get('agency-name');
        this.setRoutes();
    }

    private async setRoutes() {
        if (!this.agency) return;
        (await this.communication.getRoutesFromAgency(this.agency))
            .forEach(doc => this.routes.push({ ...doc.data(), id: doc.id } as Route));
        this.routes = this.routes.sort((a, b) => a.id.length - b.id.length);
    }
}

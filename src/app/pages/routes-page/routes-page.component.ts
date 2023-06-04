import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@app/interfaces/concepts';
import { StaticDataService } from '@app/services/static-data.service';

@Component({
    selector: 'app-routes-page',
    templateUrl: './routes-page.component.html',
    styleUrls: ['./routes-page.component.css']
})
export class RoutesPageComponent {
    agency: string | null;
    routes: Route[] = [];

    constructor(private route: ActivatedRoute, private stDataService: StaticDataService) {
        this.agency = this.route.snapshot.paramMap.get('agency-name');
        this.setRoutes();
    }

    private async setRoutes() {
        if (!this.agency) return;
        this.routes = (await this.stDataService.getRoutesFromAgency(this.agency))
            .sort((a, b) => a.id.length - b.id.length);
    }
}

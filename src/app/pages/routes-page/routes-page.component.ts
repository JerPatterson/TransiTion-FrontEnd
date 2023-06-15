import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteDto } from '@app/utils/dtos';

@Component({
    selector: 'app-routes-page',
    templateUrl: './routes-page.component.html',
    styleUrls: ['./routes-page.component.css']
})
export class RoutesPageComponent {
    agency: string | null;
    routes: RouteDto[] = [];

    constructor(private route: ActivatedRoute, private staticDataService: StaticDataService) {
        this.agency = this.route.snapshot.paramMap.get('agency-name');
        this.setRoutes();
    }

    private async setRoutes() {
        if (!this.agency) return;
        this.routes = await this.staticDataService.getRoutesFromAgency(this.agency);
    }
}

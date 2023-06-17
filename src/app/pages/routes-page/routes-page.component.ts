import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteDto } from '@app/utils/dtos';

@Component({
    selector: 'app-routes-page',
    templateUrl: './routes-page.component.html',
    styleUrls: ['./routes-page.component.css']
})
export class RoutesPageComponent {
    routes: RouteDto[] = [];

    @Output() newRouteId = new EventEmitter<string>();
    @Input() set agencyId(value: string) {
        if (value !== this.currentAgencyId) {
            this.currentAgencyId = value;
            this.setRoutes();
        }
    };

    private currentAgencyId: string = '';

    constructor(private staticDataService: StaticDataService) {}

    onClick(agencyId: string) {
        this.newRouteId.emit(agencyId);
    }

    private async setRoutes() {
        if (this.currentAgencyId) {
            this.routes = await this.staticDataService.getRoutesFromAgency(this.currentAgencyId);
        }
    }
}

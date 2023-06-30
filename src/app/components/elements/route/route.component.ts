import { Component, Input } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteDto } from '@app/utils/dtos';

@Component({
    selector: 'app-route',
    templateUrl: './route.component.html',
    styleUrls: ['./route.component.css']
})
export class RouteComponent {
    @Input() route!: RouteDto;

    constructor(private staticDataService: StaticDataService) {
        this.setRoute();
    }

    async setRoute() {
        const routeDto = await this.staticDataService.getRouteById('trains', '4');
        if (routeDto) this.route = { ...routeDto, agency_id: 'stl' };
    }
}

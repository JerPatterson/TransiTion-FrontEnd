import { Component, Input, OnChanges } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteDto, StopDto } from '@app/utils/dtos';

@Component({
    selector: 'app-stop',
    templateUrl: './stop.component.html',
    styleUrls: ['./stop.component.css']
})
export class StopComponent implements OnChanges {
    @Input() stop!: StopDto;
    @Input() agencyId!: string;
    @Input() selected: boolean = false;

    routes: (RouteDto | undefined)[] = [];

    stopIconHref!: string;
    wheelchairIconHref = './assets/icons/wheelchair.svg#wheelchair';

    constructor(private staticDataService: StaticDataService) {}

    ngOnChanges() {
        this.setHref();
        this.setRoutes();
    }

    setHref() {
        switch (this.stop?.stop_shelter) {
            case 0:
                this.stopIconHref = './assets/icons/stop-sign.svg#stop-sign';
                break;
            case 1:
                this.stopIconHref = './assets/icons/stop.svg#stop';
                break;
            default:
                this.stopIconHref = './assets/icons/stop-sign.svg#stop-sign';
        }
    }

    async setRoutes() {
        this.routes = await Promise.all(
            this.stop.route_ids.sort().map(async (routeId) => {
                return this.staticDataService.getRouteById(this.agencyId, routeId);
            })
        );
    }
}

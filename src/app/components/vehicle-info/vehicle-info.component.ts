import { Component, Input } from '@angular/core';
import { RealtimeDataService } from '@app/services/realtime/realtime-data.service';
import { StaticDataService } from '@app/services/static/static-data.service';
import { RouteDto } from '@app/utils/dtos';
import { RouteType } from '@app/utils/enums';
import { AGENCY_TO_STYLE, AgencyStyle } from '@app/utils/styles';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';


@Component({
    selector: 'app-vehicle-info',
    templateUrl: './vehicle-info.component.html',
    styleUrls: ['./vehicle-info.component.css']
})
export class VehicleInfoComponent {
    route: RouteDto | undefined;
    style: AgencyStyle | undefined;
    iconLink: string | undefined;
    lastSeen: number = 0;

    @Input() vehicle!: GtfsRealtimeBindings.transit_realtime.IVehiclePosition;

    constructor(private rtDataService: RealtimeDataService, private stDataService: StaticDataService) {
        this.setVehicle()
    }

    private async setVehicle() {
        this.vehicle = await this.rtDataService.getVehicleFromAgencyById('stm', '39039');
        this.route = await this.stDataService.getRouteById('stm', '777');
        this.style = AGENCY_TO_STYLE.get('stm');
        this.iconLink = this.getIconLinkFromRouteType(this.route?.route_type);

        this.lastSeen = this.vehicle.timestamp ? Math.round(Date.now() / 1000 - (this.vehicle.timestamp as number)) : 0;
    }

    private getIconLinkFromRouteType(type?: RouteType | null): string {
        switch(type) {
            case RouteType.Subway:
                return './assets/icons/subway.svg#subway';
            case RouteType.Rail:
                return './assets/icons/train.svg#train';
            default:
                return './assets/icons/bus.svg#bus';
        }
    }
}

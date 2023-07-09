import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { RealtimeDataService } from '@app/services/realtime/realtime-data.service';
import { StaticDataService } from '@app/services/static/static-data.service';
import { METERS_IN_KM, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS, SECONDS_IN_HOUR } from '@app/utils/constants';
import { RouteDto } from '@app/utils/dtos';
import { RouteType } from '@app/utils/enums';
import { AGENCY_TO_STYLE, AgencyStyle } from '@app/utils/styles';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';


@Component({
    selector: 'app-vehicle-info',
    templateUrl: './vehicle-info.component.html',
    styleUrls: ['./vehicle-info.component.css']
})
export class VehicleInfoComponent implements AfterViewInit, OnDestroy {
    route: RouteDto | undefined;
    style: AgencyStyle | undefined;
    iconLink: string | undefined;
    
    lastSeenString: string = '';
    speedKmHrString: string = '';
    occupancyString: string = '';

    @Input() agencyId!: string;
    @Input() vehicle!: GtfsRealtimeBindings.transit_realtime.IVehiclePosition;

    private timeSinceUpdate = 0;
    private timeSinceUpdateInterval!: NodeJS.Timer;

    constructor(
        private rtDataService: RealtimeDataService,
        private stDataService: StaticDataService
    ) {
        this.setVehicle();
    }

    ngAfterViewInit(): void {}

    ngOnDestroy(): void {
        clearInterval(this.timeSinceUpdateInterval);
    }

    private async setVehicle() {
        this.vehicle = await this.rtDataService.getVehicleFromAgencyById('stm', '42048');
        this.route = await this.stDataService.getRouteById('stm', '777');
        this.style = AGENCY_TO_STYLE.get('stm');
        this.iconLink = this.getIconLinkFromRouteType(this.route?.route_type);

        setTimeout(() => {
            this.setLastSeenValue();
            this.setSpeedValue();
            this.setOccupancyStatusValue();
        });
    }

    private setLastSeenValue(): void {
        if (!this.vehicle.timestamp) {
            this.lastSeenString = 'une période indéterminée...';
        } else {
            this.timeSinceUpdate = Math.round(Date.now() / ONE_SEC_IN_MS - (this.vehicle.timestamp as number));
            this.lastSeenString = this.getRoundTimeString(this.timeSinceUpdate);
            this.timeSinceUpdateInterval = setInterval(
                () => {
                    this.lastSeenString = this.getRoundTimeString(++this.timeSinceUpdate)
                },
                ONE_SEC_IN_MS
            );
        }
    }

    private getRoundTimeString(timeInSec: number): string {
        if (timeInSec < ONE_MINUTE_IN_SEC) {
            return `${timeInSec} sec.`;
        } else if (timeInSec < SECONDS_IN_HOUR) {
            return `${Math.round(timeInSec / ONE_MINUTE_IN_SEC)} min.`
        } else {
            return `${Math.round(timeInSec / (SECONDS_IN_HOUR))} hr.`
        }
    }

    private setSpeedValue(): void {
        if (!this.vehicle.position?.speed) {
            this.speedKmHrString = ''
        } else {
            this.speedKmHrString = `${
                Math.round(this.vehicle.position.speed * SECONDS_IN_HOUR / METERS_IN_KM)
            } km/h`
        }
    }

    private setOccupancyStatusValue(): void {
        console.log(this.vehicle.occupancyStatus);
        if (!this.vehicle.occupancyStatus) {
            this.occupancyString = ''
        } else {
            const occupancyStatusType = GtfsRealtimeBindings.transit_realtime.VehiclePosition.OccupancyStatus;
            switch (this.vehicle.occupancyStatus as any) {
                case 'EMPTY':
                    this.occupancyString = 'Vide';
                    break;
                case 'MANY_SEATS_AVAILABLE':
                case occupancyStatusType.MANY_SEATS_AVAILABLE:
                    this.occupancyString = 'Plusieurs sièges diponibles';
                    break;
                case 'FEW_SEATS_AVAILABLE':
                case occupancyStatusType.FEW_SEATS_AVAILABLE:
                    this.occupancyString = 'Quelques sièges disponibles';
                    break;
                case 'STANDING_ROOM_ONLY':
                case occupancyStatusType.STANDING_ROOM_ONLY:
                    this.occupancyString = 'Places debout seulement';
                    break;
                case 'CRUSHED_STANDING_ROOM_ONLY':
                case occupancyStatusType.CRUSHED_STANDING_ROOM_ONLY:
                    this.occupancyString = 'Pratiquement plein';
                    break;
                default:
                    this.occupancyString = 'Inconnue';
            }
        }
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

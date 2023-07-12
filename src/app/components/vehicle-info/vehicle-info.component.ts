import { OnChanges, Component, Input, OnDestroy } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { METERS_IN_KM, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS, SECONDS_IN_HOUR } from '@app/utils/constants';
import { RouteDto, TripDto } from '@app/utils/dtos';
import { RouteType } from '@app/utils/enums';
import { AGENCY_TO_STYLE, AgencyStyle } from '@app/utils/styles';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';


@Component({
    selector: 'app-vehicle-info',
    templateUrl: './vehicle-info.component.html',
    styleUrls: ['./vehicle-info.component.css']
})
export class VehicleInfoComponent implements OnChanges, OnDestroy {
    route: RouteDto | undefined;
    trip: TripDto | undefined;
    style: AgencyStyle | undefined;

    iconLink: string = '';
    lastSeenString: string = '';
    speedKmHrString: string = '';
    occupancyString: string = '';
    stopStatusString: string = '';
    congestionLevelString: string = '';
    scheduleRelationshipString: string = '';

    @Input() agencyId!: string;
    @Input() vehicle!: GtfsRealtimeBindings.transit_realtime.IVehiclePosition;

    private timeSinceUpdate = 0;
    private timeSinceUpdateInterval!: NodeJS.Timer;

    constructor(private stDataService: StaticDataService) {}

    ngOnChanges(): void {
        this.clearTimer();
        this.setVehicleInfoValues();
    }

    ngOnDestroy(): void {
        this.clearTimer()
    }

    private clearTimer(): void {
        clearInterval(this.timeSinceUpdateInterval);
    }

    private async setVehicleInfoValues() {
        if (this.vehicle.trip?.routeId && this.vehicle.trip?.tripId) {
            this.route = await this.stDataService.getRouteById(this.agencyId, this.vehicle.trip.routeId);
            this.trip = await this.stDataService.getTrip( // TODO Stl...
                this.agencyId, this.agencyId === 'stl' ? 
                'JUIN23' + this.vehicle.trip.tripId : 
                this.vehicle.trip.tripId);
        } else {
            this.route = undefined;
            this.trip = undefined;
        }
        this.style = AGENCY_TO_STYLE.get(this.agencyId);
        this.iconLink = this.getIconLinkFromRouteType(this.route?.route_type);

        this.setLastSeenValue();
        this.setSpeedValue();
        this.setOccupancyStatusValue();
        this.setVehicleStopStatusValue();
        this.setCongestionLevelValue();
        this.setScheduleRelationshipValue();
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
        if (!this.vehicle.occupancyStatus) {
            this.occupancyString = ''
        } else {
            const occupancyStatusType = GtfsRealtimeBindings.transit_realtime.VehiclePosition.OccupancyStatus;
            switch (this.vehicle.occupancyStatus as any) {
                case 'EMPTY':
                case occupancyStatusType.EMPTY:
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
                case 'FULL':
                case occupancyStatusType.FULL:
                    this.occupancyString = 'Plein';
                    break;
                case 'NOT_BOARDABLE':
                case 'NOT_ACCEPTING_PASSENGER':
                case occupancyStatusType.NOT_BOARDABLE:
                case occupancyStatusType.NOT_ACCEPTING_PASSENGERS:
                    this.occupancyString = "N'accepte pas de passagers";
                    break;
                default:
                    this.occupancyString = 'Inconnue';
            }
        }
    }

    private setVehicleStopStatusValue(): void {
        if (!this.vehicle.currentStatus) {
            this.stopStatusString = ''
        } else {
            const vehicleStopStatusType = GtfsRealtimeBindings.transit_realtime.VehiclePosition.VehicleStopStatus;
            switch (this.vehicle.currentStatus as any) {
                case 'INCOMING_AT':
                case vehicleStopStatusType.INCOMING_AT:
                    this.stopStatusString = "Tout près de l'arrêt";
                    break;
                case 'STOPPED_AT':
                case vehicleStopStatusType.STOPPED_AT:
                    this.stopStatusString = "À l'arrêt";
                    break;
                case 'IN_TRANSIT_TO':
                case vehicleStopStatusType.IN_TRANSIT_TO:
                    this.stopStatusString = 'En déplacement';
                    break;
                default:
                    this.stopStatusString = 'Inconnue';
            }
        }
    }

    private setScheduleRelationshipValue(): void {
        const scheduleRelationshipType = GtfsRealtimeBindings.transit_realtime.TripDescriptor.ScheduleRelationship;
        switch (this.vehicle.currentStatus as any) {
            case 'ADDED':
            case scheduleRelationshipType.ADDED:
                this.scheduleRelationshipString = 'Ajouté';
                break;
            case 'CANCELED':
            case scheduleRelationshipType.CANCELED:
                this.scheduleRelationshipString = 'Annulé';
                break;
            case 'DUPLICATED':
            case scheduleRelationshipType.DUPLICATED:
                this.scheduleRelationshipString = 'Dupliqué';
                break;
            case 'REPLACEMENT':
            case scheduleRelationshipType.REPLACEMENT:
                this.scheduleRelationshipString = 'Remplacement';
                break;
            case 'UNSCHEDULE':
                case scheduleRelationshipType.UNSCHEDULED:
                    this.scheduleRelationshipString = 'Non-prévu';
                    break;
            default:
                this.scheduleRelationshipString = 'Prévu';
        }
    }

    private setCongestionLevelValue(): void {
        if (!this.vehicle.congestionLevel) {
            this.congestionLevelString = ''
        } else {
            const congestionLevelType = GtfsRealtimeBindings.transit_realtime.VehiclePosition.CongestionLevel;
            switch (this.vehicle.currentStatus as any) {
                case 'RUNNING_SMOOTHLY':
                case congestionLevelType.RUNNING_SMOOTHLY:
                    this.congestionLevelString = 'Fluide';
                    break;
                case 'STOP_AND_GO':
                case congestionLevelType.STOP_AND_GO:
                    this.congestionLevelString = 'Au ralenti';
                    break;
                case 'CONGESTION':
                case congestionLevelType.CONGESTION:
                    this.congestionLevelString = 'Congestion';
                    break;
                case 'SEVERE_CONGESTION':
                case congestionLevelType.SEVERE_CONGESTION:
                    this.congestionLevelString = 'Congestion sévère';
                    break;
                default:
                    this.congestionLevelString = 'Inconnue';
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

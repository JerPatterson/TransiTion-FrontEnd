import { OnChanges, Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { RealtimeDataService } from '@app/services/realtime/realtime-data.service';
import { StaticDataService } from '@app/services/static/static-data.service';
import { VehicleId } from '@app/utils/component-interface';
import { METERS_IN_KM, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS, SECONDS_IN_HOUR } from '@app/utils/constants';
import { RouteType } from '@app/utils/enums';
import { VehicleAttributes } from '@app/utils/info.components';
import { AGENCY_TO_STYLE } from '@app/utils/styles';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';


@Component({
    selector: 'app-vehicle-info',
    templateUrl: './vehicle-info.component.html',
    styleUrls: ['./vehicle-info.component.css']
})
export class VehicleInfoComponent implements OnChanges, OnDestroy {
    @Input() vehicleId!: VehicleId;
    @Output() hide = new EventEmitter();

    attributes: VehicleAttributes = {} as VehicleAttributes;
    vehicle?: GtfsRealtimeBindings.transit_realtime.IVehiclePosition;

    private timeSinceUpdate = 0;
    private timeSinceUpdateInterval!: NodeJS.Timer;
    private refreshVehicleDataInterval!: NodeJS.Timer;


    constructor(
        private stDataService: StaticDataService,
        private rtDataService: RealtimeDataService,
    ) {}


    ngOnChanges(): void {
        this.clearTimers();
        this.setVehicleAttributes();
        this.attributes.style = AGENCY_TO_STYLE.get(this.vehicleId.agencyId);
        this.attributes.iconLink = this.getIconLinkFromRouteType(this.attributes.route?.route_type);


        this.refreshVehicleDataInterval = setInterval(() => {
            this.setVehicleAttributes();
        }, 30 * ONE_SEC_IN_MS);

        this.timeSinceUpdateInterval = setInterval(() => {
            this.attributes.lastSeenString = this.getRoundTimeString(++this.timeSinceUpdate);
        }, ONE_SEC_IN_MS);
    }

    ngOnDestroy(): void {
        this.clearTimers()
    }

    handleHideClick() {
        this.hide.emit();
        this.clearTimers();
    }

    private clearTimers(): void {
        clearInterval(this.timeSinceUpdateInterval);
        clearInterval(this.refreshVehicleDataInterval);
    }

    private async setVehicleAttributes() {
        await this.setVehicle();

        if (this.vehicle?.trip?.routeId) {
            await this.setRoute(this.vehicleId.agencyId, this.vehicle?.trip.routeId);
        } else {
            this.attributes.route = undefined;
        }

        if (this.vehicle?.trip?.tripId) {
            await this.setTrip(this.vehicleId.agencyId, this.vehicle?.trip.tripId);
        } else {
            this.attributes.trip = undefined;
        }

        this.setLastSeenValue();
        this.setSpeedValue();
        this.setBearingValue();
        this.setOccupancyStatusValue();
        this.setVehicleStopStatusValue();
        this.setCongestionLevelValue();
        this.setScheduleRelationshipValue();
    }


    private async setVehicle() {
        if (!this.vehicleId) return;
        this.vehicle = await this.rtDataService.getVehicleFromAgencyById(
            this.vehicleId.agencyId,  
            this.vehicleId.vehicleId
        );
    }

    private async setRoute(agencyId: string, routeId: string) {
        try {
            this.attributes.route = await this.stDataService.getRouteById(agencyId, routeId);
        } catch {
            this.attributes.route = undefined;
        }
    }

    private async setTrip(agencyId: string, tripId: string) {
        try {
            this.attributes.trip = await this.stDataService.getTripById(agencyId, tripId);
        } catch {
            this.attributes.trip = undefined;
        }
    }


    private setLastSeenValue(): void {
        if (!this.vehicle?.timestamp) {
            this.attributes.lastSeenString = 'une période indéterminée...';
        } else {
            this.timeSinceUpdate = Math.round(Date.now() / ONE_SEC_IN_MS - (this.vehicle.timestamp as number));
            this.attributes.lastSeenString = this.getRoundTimeString(this.timeSinceUpdate);
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
        if (!this.vehicle?.position?.speed) {
            this.attributes.speedKmHrString = ''
        } else {
            this.attributes.speedKmHrString = `${
                Math.round(this.vehicle?.position.speed * SECONDS_IN_HOUR / METERS_IN_KM)
            } km/h`
        }
    }

    private setBearingValue(): void {
        this.attributes.bearing = -1;
        if (!this.vehicle?.position?.bearing ) return;
        if (this.vehicle?.position?.bearing >= 0)
            this.attributes.bearing = this.vehicle?.position?.bearing;
    }

    private setOccupancyStatusValue(): void {
        const occupancyStatusType = GtfsRealtimeBindings.transit_realtime.VehiclePosition.OccupancyStatus;
        switch (this.vehicle?.occupancyStatus as any) {
            case 'EMPTY':
            case occupancyStatusType.EMPTY:
                this.attributes.occupancyString = 'Vide';
                break;
            case 'MANY_SEATS_AVAILABLE':
            case occupancyStatusType.MANY_SEATS_AVAILABLE:
                this.attributes.occupancyString = 'Plusieurs sièges diponibles';
                break;
            case 'FEW_SEATS_AVAILABLE':
            case occupancyStatusType.FEW_SEATS_AVAILABLE:
                this.attributes.occupancyString = 'Quelques sièges disponibles';
                break;
            case 'STANDING_ROOM_ONLY':
            case occupancyStatusType.STANDING_ROOM_ONLY:
                this.attributes.occupancyString = 'Places debout seulement';
                break;
            case 'CRUSHED_STANDING_ROOM_ONLY':
            case occupancyStatusType.CRUSHED_STANDING_ROOM_ONLY:
                this.attributes.occupancyString = 'Pratiquement plein';
                break;
            case 'FULL':
            case occupancyStatusType.FULL:
                this.attributes.occupancyString = 'Plein';
                break;
            case 'NOT_BOARDABLE':
            case 'NOT_ACCEPTING_PASSENGER':
            case occupancyStatusType.NOT_BOARDABLE:
            case occupancyStatusType.NOT_ACCEPTING_PASSENGERS:
                this.attributes.occupancyString = "N'accepte pas de passagers";
                break;
            default:
                this.attributes.occupancyString = 'Inconnu';
        }
    }

    private setVehicleStopStatusValue(): void {
        const vehicleStopStatusType = GtfsRealtimeBindings.transit_realtime.VehiclePosition.VehicleStopStatus;
        switch (this.vehicle?.currentStatus as any) {
            case 'INCOMING_AT':
            case vehicleStopStatusType.INCOMING_AT:
                this.attributes.stopStatusString = "Tout près de l'arrêt";
                break;
            case 'STOPPED_AT':
            case vehicleStopStatusType.STOPPED_AT:
                this.attributes.stopStatusString = "À l'arrêt";
                break;
            case 'IN_TRANSIT_TO':
            case vehicleStopStatusType.IN_TRANSIT_TO:
                this.attributes.stopStatusString = 'En déplacement';
                break;
            default:
                this.attributes.stopStatusString = 'Inconnu';
        }
    }

    private setScheduleRelationshipValue(): void {
        const scheduleRelationshipType = GtfsRealtimeBindings.transit_realtime.TripDescriptor.ScheduleRelationship;
        switch (this.vehicle?.currentStatus as any) {
            case 'ADDED':
            case scheduleRelationshipType.ADDED:
                this.attributes.scheduleRelationshipString = 'Ajouté';
                break;
            case 'CANCELED':
            case scheduleRelationshipType.CANCELED:
                this.attributes.scheduleRelationshipString = 'Annulé';
                break;
            case 'DUPLICATED':
            case scheduleRelationshipType.DUPLICATED:
                this.attributes.scheduleRelationshipString = 'Dupliqué';
                break;
            case 'REPLACEMENT':
            case scheduleRelationshipType.REPLACEMENT:
                this.attributes.scheduleRelationshipString = 'Remplacement';
                break;
            case 'UNSCHEDULE':
                case scheduleRelationshipType.UNSCHEDULED:
                    this.attributes.scheduleRelationshipString = 'Non-prévu';
                    break;
            default:
                this.attributes.scheduleRelationshipString = 'Prévu';
        }
    }

    private setCongestionLevelValue(): void {
        const congestionLevelType = GtfsRealtimeBindings.transit_realtime.VehiclePosition.CongestionLevel;
        switch (this.vehicle?.currentStatus as any) {
            case 'RUNNING_SMOOTHLY':
            case congestionLevelType.RUNNING_SMOOTHLY:
                this.attributes.congestionLevelString = 'Fluide';
                break;
            case 'STOP_AND_GO':
            case congestionLevelType.STOP_AND_GO:
                this.attributes.congestionLevelString = 'Au ralenti';
                break;
            case 'CONGESTION':
            case congestionLevelType.CONGESTION:
                this.attributes.congestionLevelString = 'Congestion';
                break;
            case 'SEVERE_CONGESTION':
            case congestionLevelType.SEVERE_CONGESTION:
                this.attributes.congestionLevelString = 'Congestion sévère';
                break;
            default:
                this.attributes.congestionLevelString = 'Inconnu';
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

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StopId } from '@app/utils/component-interface';
import { HOUR_IN_DAY, ONE_HOUR_IN_MIN } from '@app/utils/constants';
import { RouteDto, StopDto, TimeDto } from '@app/utils/dtos';
import { WheelchairBoardingType } from '@app/utils/enums';
import { StopAttributes } from '@app/utils/info.components';
import { AGENCY_TO_STYLE } from '@app/utils/styles';

@Component({
    selector: 'app-stop-info',
    templateUrl: './stop-info.component.html',
    styleUrls: ['./stop-info.component.css']
})
export class StopInfoComponent implements OnChanges {
    @Input() stopId!: StopId;
    @Output() hide = new EventEmitter();

    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport!: CdkVirtualScrollViewport;

    stop?: StopDto;
    attributes: StopAttributes = {} as StopAttributes;

    routeByRouteId = new Map<string, RouteDto>();

    mapIconHref = './assets/icons/map.svg#map';
    routeIconHref = './assets/icons/route.svg#route';
    wheelchairIconHref = './assets/icons/wheelchair.svg#wheelchair';

    constructor(private stDataService: StaticDataService) {}


    trackByTime = (_: number, time: TimeDto) => time.trip_id;

    ngOnChanges() {
        this.setStopAttributes();
    }
    
    async setStopAttributes() {
        await this.setStop();
        
        this.setRoutesValue();
        this.setTimesValue();
        this.setWheelchairAccessibleValue();

        this.attributes.style = AGENCY_TO_STYLE.get(this.stopId.agencyId);
        this.attributes.iconLink = this.getIconLinkFromShelterType(this.stop?.stop_shelter);
    }

    handleHideClick() {
        this.hide.emit();
    }


    private async setStop() {
        if (!this.stopId) return;
        this.stop = await this.stDataService.getStopById(
            this.stopId.agencyId,
            this.stopId.stopId
        );
    }

    private async setRoutesValue() {
        this.attributes.routes = [];
        if (!this.stop) return;
        this.attributes.routes = (await Promise.all(
            this.stop.route_ids.map(async (routeId) => {
                const route = await this.stDataService.getRouteById(this.stopId.agencyId, routeId);
                if (route) this.routeByRouteId.set(routeId, route);
                return route as RouteDto;
            }))).sort((a, b) => {
                const aNumber = a.route_short_name.match(/\d+/)?.[0];
                const bNumber = b.route_short_name.match(/\d+/)?.[0];
                return aNumber && bNumber ?
                    parseInt(aNumber, 10) - parseInt(bNumber, 10) : 0;
            });
    }

    private async setTimesValue() {
        this.attributes.times = [];
        if (!this.stop) return;
        this.attributes.times = await this.stDataService.getTimesFromStop(
            this.stopId.agencyId, this.stopId.stopId);
        this.setTimeStartIndex();
    }

    private setTimeStartIndex() {
        let startIndex = 0;
        let timeDifference = HOUR_IN_DAY * ONE_HOUR_IN_MIN;
        const now = new Date(Date.now());
        this.attributes.times.find((time, index) => {
            const newTimeDifference = this.getMinutesBetween(now, time.arrival_time);
            if (timeDifference < newTimeDifference) {
                startIndex = index;
                return true;
            } else {
                timeDifference = newTimeDifference;
                return false;
            }
        });

        setTimeout(() => this.cdkVirtualScrollViewport.scrollToIndex(startIndex));
    }

    private getMinutesBetween(now: Date, time: string): number {
        const hours = Number(time.split(':')[0]);
        const minutes = Number(time.split(':')[1]);
        return Math.abs(Math.abs(hours - now.getHours()) * ONE_HOUR_IN_MIN - minutes + now.getMinutes());
    }

    private setWheelchairAccessibleValue() {
        switch (this.stop?.wheelchair_boarding) {
            case WheelchairBoardingType.NoInformation:
                this.attributes.wheelchairAccessibleString = 'Aucune information disponible';
                break;
            case WheelchairBoardingType.SomeVehicles:
                this.attributes.wheelchairAccessibleString = "L'arrêt est accessible";
                break;
            case WheelchairBoardingType.NotPossible:
                this.attributes.wheelchairAccessibleString = 'Impossible';
                break;
        }
    }

    private getIconLinkFromShelterType(type?: number | undefined) {
        switch (type) {
            case 0:
                return './assets/icons/stop-sign.svg#stop-sign';
            case 1:
                return './assets/icons/stop.svg#stop';
            default:
                return './assets/icons/stop-sign.svg#stop-sign';
        }
    }
}

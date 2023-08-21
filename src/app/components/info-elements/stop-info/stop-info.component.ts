import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
export class StopInfoComponent implements OnInit {
    @Input() set stopId(value: StopId) {
        this.stopIdValue = value;
        this.routeIdsToHide.clear();
        this.setStopAttributes();
    }

    @Output() hide = new EventEmitter();

    @ViewChild('horizontalScroll', { static: true }) horizontalScrollContainer!: ElementRef;
    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport!: CdkVirtualScrollViewport;

    stop?: StopDto;
    stopIdValue!: StopId;
    attributes: StopAttributes = {} as StopAttributes;

    routeIdsToHide = new Set<string>();
    routeByRouteId = new Map<string, RouteDto>();

    mapIconHref = './assets/icons/map.svg#map';
    routeIconHref = './assets/icons/route.svg#route';
    wheelchairIconHref = './assets/icons/wheelchair.svg#wheelchair';

    private times: TimeDto[] = [];

    constructor(private stDataService: StaticDataService) {}


    trackByTime = (_: number, time: TimeDto) => time.trip_id;

    ngOnInit(): void {
        this.horizontalScrollContainer.nativeElement
            .addEventListener('wheel', (ev: WheelEvent) => {
                ev.preventDefault();
                this.horizontalScrollContainer.nativeElement.scrollLeft += ev.deltaY;
            });
    }

    handleHideClick(): void {
        this.hide.emit();
    }

    handleRouteFilterClick(routeId: string): void {
        if (!this.routeIdsToHide.size)
            for (const routeId of this.routeByRouteId.keys()) {
                this.routeIdsToHide.add(routeId);
            }

        if (this.routeIdsToHide.has(routeId))
            this.routeIdsToHide.delete(routeId);
        else
            this.routeIdsToHide.add(routeId);

        if (this.routeIdsToHide.size === this.routeByRouteId.size)
            this.routeIdsToHide.clear();
        this.setTimesValueToDisplay();
    }
    
    async setStopAttributes(): Promise<void> {
        await this.setStop();
        this.setRoutesValue();
        this.setTimesValue();
        this.setWheelchairAccessibleValue();
        this.attributes.style = AGENCY_TO_STYLE.get(this.stopIdValue.agencyId);
        this.attributes.iconLink = this.getIconLinkFromShelterType(this.stop?.stop_shelter);
    }


    private async setStop(): Promise<void> {
        if (!this.stopIdValue) return;
        this.stop = await this.stDataService.getStopById(
            this.stopIdValue.agencyId,
            this.stopIdValue.stopId
        );
    }

    private async setRoutesValue(): Promise<void> {
        this.attributes.routes = [];
        if (!this.stop) return;
        this.attributes.routes = (await Promise.all(
            this.stop.route_ids.map(async (routeId) => {
                const route = await this.stDataService.getRouteById(this.stopIdValue.agencyId, routeId);
                if (route) this.routeByRouteId.set(routeId, route);
                return route as RouteDto;
            }))).sort((a, b) => {
                const aNumber = a.route_short_name.match(/\d+/)?.[0];
                const bNumber = b.route_short_name.match(/\d+/)?.[0];
                return aNumber && bNumber ?
                    parseInt(aNumber, 10) - parseInt(bNumber, 10) : 0;
            });
    }

    private async setTimesValue(): Promise<void> {
        this.times = [];
        if (!this.stop) return;
        this.times = await this.stDataService.getTimesFromStop(
            this.stopIdValue.agencyId, this.stopIdValue.stopId);
        this.setTimesValueToDisplay();
    }

    private setTimesValueToDisplay(): void {
        if (!this.routeIdsToHide.size) {
            this.attributes.times = this.times;
        } else {
            this.attributes.times = this.times.filter((time) => {
                return time.route_id && !this.routeIdsToHide.has(time.route_id)
            });
        }
        this.setTimesStartIndex();
    }

    private setTimesStartIndex(): void {
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

import { Component, Input } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StopId } from '@app/utils/component-interface';
import { StopDto, TimeDto } from '@app/utils/dtos';
import { WheelchairBoardingType } from '@app/utils/enums';
import { StopAttributes } from '@app/utils/info.components';
import { AGENCY_TO_STYLE } from '@app/utils/styles';

@Component({
    selector: 'app-stop-info',
    templateUrl: './stop-info.component.html',
    styleUrls: ['./stop-info.component.css']
})
export class StopInfoComponent {
    @Input() stopId: StopId = { agencyId: 'lrrs', stopId: '76050' }; // TODO TEMP

    stop?: StopDto;
    attributes: StopAttributes = {} as StopAttributes;

    mapIconHref = './assets/icons/map.svg#map';
    routeIconHref = './assets/icons/route.svg#route';
    wheelchairIconHref = './assets/icons/wheelchair.svg#wheelchair';

    constructor(private stDataService: StaticDataService) {}


    trackByTime = (_: number, time: TimeDto) => time.trip_id;

    ngOnInit() {
        this.setStopAttributes();
        this.attributes.style = AGENCY_TO_STYLE.get(this.stopId.agencyId);
        this.attributes.iconLink = this.getIconLinkFromShelterType(this.stop?.stop_shelter)
    }
    
    async setStopAttributes() {
        await this.setStop();
        
        this.setRoutesValue();
        this.setTimesValue();
        this.setWheelchairAccessibleValue();
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
        this.attributes.routes = await Promise.all(
            this.stop.route_ids.sort().map(async (routeId) => {
                return this.stDataService.getRouteById(this.stopId.agencyId, routeId);
            })
        );
    }

    private async setTimesValue() {
        this.attributes.times = [];
        if (!this.stop) return;
        this.attributes.times = await this.stDataService.getTimesFromStop(
            this.stopId.agencyId, this.stopId.stopId);
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

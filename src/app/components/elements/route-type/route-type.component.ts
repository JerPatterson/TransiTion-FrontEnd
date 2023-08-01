import { Component, Input, OnChanges } from '@angular/core';
import { RouteDto } from '@app/utils/dtos';
import { RouteType } from '@app/utils/enums';

@Component({
    selector: 'app-route-type',
    templateUrl: './route-type.component.html',
    styleUrls: ['./route-type.component.css']
})
export class RouteTypeComponent implements OnChanges {
    @Input() route!: RouteDto;
    @Input() applyColor!: boolean;

    color!: string;
    href!: string;

    ngOnChanges() {
        this.setColor();
        this.setHref();
    }

    setColor() {
        this.color = (this.applyColor ? `#${this.route?.route_text_color}` : '#000000');
    }

    setHref() {
        switch (this.route?.route_type) {
            case RouteType.Subway:
                this.href = './assets/icons/subway.svg#subway';
                break;
            case RouteType.Rail:
                this.href = './assets/icons/train.svg#train';
                break;
            case RouteType.Bus:
                this.href = './assets/icons/bus.svg#bus';
                break;
            case RouteType.SharedTaxi:
                this.href = './assets/icons/taxi.svg#taxi';
                break;
            default:
                this.href = './assets/icons/bus.svg#bus';
        }
    }
}

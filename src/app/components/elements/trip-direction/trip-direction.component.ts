import { Component, Input, OnChanges } from '@angular/core';
import { RouteDto, TripDto } from '@app/utils/dtos';

@Component({
    selector: 'app-trip-direction',
    templateUrl: './trip-direction.component.html',
    styleUrls: ['./trip-direction.component.css']
})
export class TripDirectionComponent implements OnChanges {
    @Input() route!: RouteDto;
    @Input() trip!: TripDto;

    color!: string;
    headsign!: string;

    ngOnChanges() {
        this.setColor();
        this.setHeadsign();
    }

    setColor() {
        this.color = `#${this.route?.route_text_color}`;
    }

    setHeadsign() {
        this.headsign = this.trip?.trip_headsign;
    }
}

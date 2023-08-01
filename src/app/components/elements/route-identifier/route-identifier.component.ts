import { Component, Input, OnChanges } from '@angular/core';
import { RouteDto } from '@app/utils/dtos';

@Component({
    selector: 'app-route-identifier',
    templateUrl: './route-identifier.component.html',
    styleUrls: ['./route-identifier.component.css']
})
export class RouteIdentifierComponent implements OnChanges {
    @Input() route!: RouteDto;
    @Input() showAgency!: boolean;

    color!: string;
    backgroundColor!: string;

    ngOnChanges() {
        this.setColor();
        this.setBackgroundColor();
    }

    setColor() {
        this.color = `#${this.route?.route_text_color}`;
    }

    setBackgroundColor() {
        this.backgroundColor = `#${this.route?.route_color}`;
    }
}

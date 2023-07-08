import { Component, Input } from '@angular/core';
import { RouteDto } from '@app/utils/dtos';

@Component({
    selector: 'app-route',
    templateUrl: './route.component.html',
    styleUrls: ['./route.component.css']
})
export class RouteComponent {
    @Input() route!: RouteDto;
}

import { Component, Input } from '@angular/core';
import { StopLocationDto } from '@app/utils/dtos';

@Component({
    selector: 'app-stop',
    templateUrl: './stop.component.html',
    styleUrls: ['./stop.component.css']
})
export class StopComponent {
    @Input() stop!: StopLocationDto;
}

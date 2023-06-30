import { Component, Input } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StopDto } from '@app/utils/dtos';

@Component({
    selector: 'app-stop',
    templateUrl: './stop.component.html',
    styleUrls: ['./stop.component.css']
})
export class StopComponent {
    @Input() stop!: StopDto;

    constructor(private stService: StaticDataService) {
        this.setStop();
    }

    async setStop() {
        this.stop = await this.stService.getStopById('stl', '41853');
    }
}

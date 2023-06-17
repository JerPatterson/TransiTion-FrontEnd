import { Component } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { AgencyDto } from '@app/utils/dtos';

@Component({
    selector: 'app-agency-list',
    templateUrl: './agency-list.component.html',
    styleUrls: ['./agency-list.component.css']
})
export class MainPageComponent {
    agencies: AgencyDto[] = [];

    constructor(private staticDataService: StaticDataService) {
        this.setAgencies();
    }

    onClick() {
        () => {};
    }
 
    private async setAgencies() {
        this.agencies = await this.staticDataService.getAgencies();
    }
}

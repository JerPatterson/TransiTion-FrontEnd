import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { AgencyDto } from '@app/utils/dtos';

@Component({
    selector: 'app-agency-list',
    templateUrl: './agency-list.component.html',
    styleUrls: ['./agency-list.component.css']
})
export class MainPageComponent implements AfterViewInit {
    agencies: AgencyDto[] = [];

    @Output() newAgencyId = new EventEmitter<string>();
    @Input() agencyId: string = '';

    constructor(private staticDataService: StaticDataService) {}

    ngAfterViewInit() {
        this.setAgencies();
    }

    onClick(agencyId: string) {
        this.newAgencyId.emit(agencyId);
    }
 
    private async setAgencies() {
        this.agencies = await this.staticDataService.getAgencies();
    }
}

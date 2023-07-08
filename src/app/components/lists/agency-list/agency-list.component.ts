import { OnInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { AgencyDto } from '@app/utils/dtos';

@Component({
    selector: 'app-agency-list',
    templateUrl: './agency-list.component.html',
    styleUrls: ['./agency-list.component.css']
})
export class AgencyListComponent implements OnInit {
    agencies: AgencyDto[] = [];
    agencyIds = new Set<string>();

    @Input() selections: string[] = [];
    @Input() set selectAll(option: boolean) {
        if (option) {
            this.agencies.forEach((agency) => {
                if (!this.agencyIds.has(agency.agency_id)) {
                    this.agencyIds.add(agency.agency_id);
                    this.addAgencyId.emit(agency.agency_id);
                }
            });
        } else {
            this.agencies.forEach((agency) => {
                this.agencyIds.delete(agency.agency_id);
                this.removeAgencyId.emit(agency.agency_id);
            })
        }
    }

    @Output() addAgencyId = new EventEmitter<string>();
    @Output() removeAgencyId = new EventEmitter<string>();

    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setAgencies();
        this.selections.forEach((agencyId) => this.agencyIds.add(agencyId))
    }

    onAgencyClick(agencyId: string) {
        if (this.agencyIds.has(agencyId)) {
            this.agencyIds.delete(agencyId);
            this.removeAgencyId.emit(agencyId);
        } else {
            this.agencyIds.add(agencyId);
            this.addAgencyId.emit(agencyId);
        }
    }
 
    private async setAgencies() {
        this.agencies = await this.staticDataService.getAgencies();
    }
}

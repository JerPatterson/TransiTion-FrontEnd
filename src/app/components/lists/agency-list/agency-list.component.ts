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
    agenciesSelected = new Set<string>();

    @Input() selections: string[] = [];
    @Input() set selectAll(option: boolean) {
        if (option) {
            this.agencies.forEach((agency) => {
                if (!this.agenciesSelected.has(agency.agency_id)) {
                    this.agenciesSelected.add(agency.agency_id);
                    this.addAgencySelected.emit(agency.agency_id);
                }
            });
        } else {
            this.agencies.forEach((agency) => {
                this.agenciesSelected.delete(agency.agency_id);
                this.removeAgencySelected.emit(agency.agency_id);
            })
        }
    }

    @Output() addAgencySelected = new EventEmitter<string>();
    @Output() removeAgencySelected = new EventEmitter<string>();

    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setAgencies();
        this.selections.forEach((agencyId) => this.agenciesSelected.add(agencyId))
    }

    onAgencyClick(agencyId: string) {
        if (this.agenciesSelected.has(agencyId)) {
            this.agenciesSelected.delete(agencyId);
            this.removeAgencySelected.emit(agencyId);
        } else {
            this.agenciesSelected.add(agencyId);
            this.addAgencySelected.emit(agencyId);
        }
    }
 
    private async setAgencies() {
        this.agencies = await this.staticDataService.getAgencies();
    }
}

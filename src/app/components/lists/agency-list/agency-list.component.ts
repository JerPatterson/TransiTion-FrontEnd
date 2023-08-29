import { OnInit, Component, EventEmitter, Output, Input } from '@angular/core';
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
        const agencyIdsToEmit: string[] = [];
        if (option) {
            this.agencies.forEach((agency) => {
                if (!this.agencyIds.has(agency.agency_id)) {
                    this.agencyIds.add(agency.agency_id);
                    agencyIdsToEmit.push(agency.agency_id);
                }
            });
            this.addAgencyIds.emit(agencyIdsToEmit);
        } else {
            if (!this.agencies.length) return;
            this.agencies.forEach((agency) => {
                this.agencyIds.delete(agency.agency_id);
                agencyIdsToEmit.push(agency.agency_id);
            });
            this.removeAgencyIds.emit(agencyIdsToEmit);
        }
    }

    @Input() set clearAll(length: number) {
        if (!length) this.agencyIds.clear();
    }


    @Output() addAgencyIds = new EventEmitter<string[]>();
    @Output() removeAgencyIds = new EventEmitter<string[]>();

    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setAgencies();
        this.selections.forEach((agencyId) => this.agencyIds.add(agencyId));
    }

    onAgencyClick(agencyId: string) {
        if (this.agencyIds.has(agencyId)) {
            this.agencyIds.delete(agencyId);
            this.removeAgencyIds.emit([agencyId]);
        } else {
            this.agencyIds.add(agencyId);
            this.addAgencyIds.emit([agencyId]);
        }
    }
 
    private async setAgencies() {
        this.agencies = await this.staticDataService.getAgencies();
    }
}

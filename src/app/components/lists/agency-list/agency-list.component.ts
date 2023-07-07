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
    selections = new Set<string>();

    @Input() currentSelections: string[] = [];

    @Output() addAgencySelected = new EventEmitter<string>();
    @Output() removeAgencySelected = new EventEmitter<string>();

    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setAgencies();
        this.currentSelections.forEach((value) => this.selections.add(value));
    }

    onAgencyClick(agencyId: string) {
        if (this.selections.has(agencyId)) {
            this.selections.delete(agencyId);
            this.removeAgencySelected.emit(agencyId);
        } else {
            this.selections.add(agencyId);
            this.addAgencySelected.emit(agencyId);
        }
    }
 
    private async setAgencies() {
        this.agencies = await this.staticDataService.getAgencies();
    }
}

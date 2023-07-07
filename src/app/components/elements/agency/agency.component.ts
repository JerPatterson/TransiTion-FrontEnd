import { Component, Input } from '@angular/core';
import { AgencyDto } from '@app/utils/dtos';

@Component({
    selector: 'app-agency',
    templateUrl: './agency.component.html',
    styleUrls: ['./agency.component.css']
})
export class AgencyComponent {
    @Input() agency!: AgencyDto;
    @Input() selected: boolean = false;

    onAgencyClick() {
        this.selected = !this.selected;
    }
}

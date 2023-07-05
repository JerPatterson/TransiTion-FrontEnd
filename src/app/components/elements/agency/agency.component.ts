import { Component, Input, OnInit } from '@angular/core';
import { AGENCY_ID_TO_THEME_COLOR } from '@app/utils/agencies-style';
import { AgencyDto } from '@app/utils/dtos';

@Component({
    selector: 'app-agency',
    templateUrl: './agency.component.html',
    styleUrls: ['./agency.component.css']
})
export class AgencyComponent implements OnInit {
    @Input() agency!: AgencyDto;

    themeColor: string = '#ffffff';

    ngOnInit() {
        console.log(this.agency);
        const color = AGENCY_ID_TO_THEME_COLOR.get(this.agency.agency_id.toLowerCase());
        if (color) this.themeColor = color;
    }
}

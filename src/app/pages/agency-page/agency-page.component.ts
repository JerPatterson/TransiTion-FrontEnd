import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-agency-page',
    templateUrl: './agency-page.component.html',
    styleUrls: ['./agency-page.component.css']
})
export class AgencyPageComponent {
    agency: string | null;

    constructor(private route: ActivatedRoute) {
        this.agency = this.route.snapshot.paramMap.get('agency-name');
    }
}

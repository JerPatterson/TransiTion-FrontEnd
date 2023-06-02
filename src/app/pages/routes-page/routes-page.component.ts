import { Component } from '@angular/core';
import { Route } from '@app/interfaces/concepts';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-routes-page',
    templateUrl: './routes-page.component.html',
    styleUrls: ['./routes-page.component.css']
})
export class RoutesPageComponent {
    routes: Route[] = [
        {
            id: '12E',
            name: '12E PONT-VIAU',
            type: 3,
        },
        {
            id: '17N',
            name: '17N AUTEUIL',
            type: 3,
        },
        {
            id: '31N',
            name: '31N AUTEUIL',
            type: 3,
        },
        {
            id: '45N',
            name: '45N AUTEUIL',
            type: 3,
        }
    ];

    constructor(private communication: CommunicationService) {}

    async setRoutes() {
        (await this.communication.getRoutesFromAgency('STL'))
            .forEach(doc => this.routes.push({ ...doc.data(), id: doc.id } as Route));
    }
}

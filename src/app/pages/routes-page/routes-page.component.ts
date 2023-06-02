import { Component } from '@angular/core';
import { Route } from '@app/interfaces/concepts';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-routes-page',
    templateUrl: './routes-page.component.html',
    styleUrls: ['./routes-page.component.css']
})
export class RoutesPageComponent {
    routes: Route[] = [];

    constructor(private communication: CommunicationService) {
        this.setRoutes();
    }

    private async setRoutes() {
        (await this.communication.getRoutesFromAgency('STL'))
            .forEach(doc => this.routes.push({ ...doc.data(), id: doc.id } as Route));
    }
}

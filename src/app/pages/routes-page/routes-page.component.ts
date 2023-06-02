import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-routes-page',
    templateUrl: './routes-page.component.html',
    styleUrls: ['./routes-page.component.css']
})
export class RoutesPageComponent {
    routes: any[] = [];

    constructor(private communication: CommunicationService) {
        this.setRoutes();
    }

    private async setRoutes() {
        (await this.communication.getRoutesFromAgency('STL'))
            .forEach(doc => {
                this.routes.push({ id: doc.id, data: doc.data()});
            });
    }
}

import { Component } from '@angular/core';

@Component({
    selector: 'app-schedule-page',
    templateUrl: './schedule-page.component.html',
    styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent {
    tripId: string = '';

    agencyId: string = '';
    routeId: string = '';
    stopId: string = '';

    agencyListSelected: boolean = false;
    routeListSelected: boolean = false;
    stopListSelected: boolean = false;
    vehicleListSelected: boolean = false;

    changeCurrentAgencyId(value: string) {
        this.agencyId = value;
        this.agencyListSelected = false;
    }

    changeCurrentRouteId(value: string) {
        this.routeId = value;
        this.routeListSelected = false;
    }

    changeCurrentStopId(value: string) {
        this.stopId = value;
        this.stopListSelected = false;
    }
}

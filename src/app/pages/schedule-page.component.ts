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

    agencySelected: boolean = false;
    routeSelected: boolean = false;
    stopSelected: boolean = false;
    vehicleSelected: boolean = false;

    displayAgencyList() {
        this.routeSelected = this.stopSelected = false;
        this.routeId = this.stopId = '';
        this.agencySelected = true;
    }

    displayRouteList() {
        this.agencySelected = this.stopSelected = false;
        this.routeSelected = true;
    }

    displayStopList() {
        this.agencySelected = this.routeSelected = false;
        this.stopSelected = true;
    }

    changeCurrentAgencyId(value: string) {
        this.agencyId = value;
        this.agencySelected = false;
    }

    changeCurrentRouteId(value: string) {
        this.routeId = value;
        this.routeSelected = false;
    }

    changeCurrentStopId(value: string) {
        this.stopId = value;
        this.stopSelected = false;
    }
}

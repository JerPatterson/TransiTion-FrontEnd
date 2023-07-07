import { Component } from '@angular/core';

@Component({
    selector: 'app-schedule-page',
    templateUrl: './schedule-page.component.html',
    styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent {
    tripId: string = '';

    agenciesSelected: string[] = [];
    routeId: string = '';
    stopId: string = '';

    agencyListSelected: boolean = false;
    routeListSelected: boolean = false;
    stopListSelected: boolean = false;
    vehicleListSelected: boolean = false;

    addAgency(agencyId: string) {
        this.agenciesSelected = this.agenciesSelected.concat([agencyId]);
    }

    removeAgency(agencyId: string) {
        this.agenciesSelected = this.agenciesSelected
            .filter((value) => value !== agencyId)
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

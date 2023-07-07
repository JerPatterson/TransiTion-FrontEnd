import { Component } from '@angular/core';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
    tripId: string = '';

    agenciesSelected: string[] = [];
    mergeAgenciesOption: boolean = false;

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

    changeMergeAgenciesOption() {
        this.mergeAgenciesOption = !this.mergeAgenciesOption;
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

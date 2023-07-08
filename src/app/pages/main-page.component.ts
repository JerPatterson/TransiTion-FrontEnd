import { Component } from '@angular/core';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
    tripId: string = '';

    agencyIdsSelected: string[] = [];
    mergeAgenciesOption: boolean = false;
    selectAllAgenciesOption: boolean = false;

    routeId: string = '';
    stopId: string = '';

    agencyListSelected: boolean = false;
    routeListSelected: boolean = false;
    stopListSelected: boolean = false;
    vehicleListSelected: boolean = false;

    addAgencyId(agencyId: string) {
        this.agencyIdsSelected = this.agencyIdsSelected.concat([agencyId]);
    }

    removeAgencyId(agencyId: string) {
        this.agencyIdsSelected = this.agencyIdsSelected
            .filter((value) => value !== agencyId)
    }

    changeMergeAgencies() {
        this.mergeAgenciesOption = !this.mergeAgenciesOption;
    }

    changeSelectAllAgencies() {
        this.selectAllAgenciesOption = !this.selectAllAgenciesOption;
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

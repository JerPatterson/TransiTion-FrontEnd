import { ChangeDetectorRef, Component, AfterContentChecked } from '@angular/core';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements AfterContentChecked {
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

    constructor(private cdref: ChangeDetectorRef) {}

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    addAgencyIds(agencyIds: string[]) {
        this.agencyIdsSelected = this.agencyIdsSelected.concat(agencyIds);
    }

    removeAgencyIds(agencyIds: string[]) {
        this.agencyIdsSelected = this.agencyIdsSelected
            .filter((value) => !agencyIds.includes(value));
    }

    changeMergeAgencies() {
        this.mergeAgenciesOption = !this.mergeAgenciesOption;
    }

    changeSelectAllAgencies() {
        this.selectAllAgenciesOption = !this.selectAllAgenciesOption;
    }

    changeMergeAgenciesOption() {
        this.mergeAgenciesOption = !this.mergeAgenciesOption;
    }

    changeSelectAllAgenciesOption() {
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

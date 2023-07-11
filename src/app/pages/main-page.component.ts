import { ChangeDetectorRef, Component, AfterContentChecked } from '@angular/core';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements AfterContentChecked {
    agencyIdsSelected: string[] = [];
    mergeAgenciesOption: boolean = false;
    selectAllAgenciesOption: boolean = false;

    routeIdsSelected: string[] = [];

    vehicleSelected!: GtfsRealtimeBindings.transit_realtime.IVehiclePosition | undefined;
    vehicleSelectedAgencyId: string = ''; 
    oldVehiclesOption: boolean = false;

    agencyListSelected: boolean = false;
    routeListSelected: boolean = false;
    stopListSelected: boolean = false;
    vehicleListSelected: boolean = false;

    constructor(private cdref: ChangeDetectorRef) {}

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    selectAgencyList(value: boolean) {
        this.agencyListSelected = value;
        this.vehicleSelected = undefined;
    }

    addAgencyIds(agencyIds: string[]) {
        this.agencyIdsSelected = this.agencyIdsSelected.concat(agencyIds);
    }

    removeAgencyIds(agencyIds: string[]) {
        this.agencyIdsSelected = this.agencyIdsSelected
            .filter((value) => !agencyIds.includes(value));

        this.routeIdsSelected = this.routeIdsSelected
            .filter((value) => !agencyIds.includes(value.split('/')[0].toUpperCase()))
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

    selectRouteList(value: boolean) {
        this.routeListSelected = value;
        this.vehicleSelected = undefined;
    }

    addRouteId(routeId: string) {
        this.routeIdsSelected = this.routeIdsSelected.concat([routeId]);
    }

    removeRouteId(routeId: string) {
        this.routeIdsSelected = this.routeIdsSelected
            .filter((value) => value !== routeId);
    }

    addVehicleSlected(vehicle: GtfsRealtimeBindings.transit_realtime.IVehiclePosition) {
        this.vehicleSelected = vehicle;
    }

    addVehicleSlectedAgencyId(agencyId: string) {
        this.vehicleSelectedAgencyId = agencyId;
    }

    changeOldVehiclesOption() {
        this.oldVehiclesOption = !this.oldVehiclesOption;
    }
}

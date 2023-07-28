import { ChangeDetectorRef, Component, AfterContentChecked } from '@angular/core';
import { MapSelectionIdentifiers, MapRenderingOptions, RouteId, MapComponentDisplayed, MapSelectionOptions, VehicleId } from '@app/utils/component-interface';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements AfterContentChecked {
    options: MapRenderingOptions = {
        darkModeEnable: false,
        showOldVehicles: false,
        useVehicleClusters: true,
        mergeAllVehicleClusters: false,
    }

    selectOptions: MapSelectionOptions = {
        allAgencies: false,
        allRoutes: false,
    }

    selections: MapSelectionIdentifiers = {
        agencies: [],
        routes: [],
        vehicle: undefined,
        stop: undefined,
    }

    componentDisplayed = MapComponentDisplayed.None;


    constructor(private cdref: ChangeDetectorRef) {}

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    changeDarkModeEnableOption() {
        this.options.darkModeEnable = !this.options.darkModeEnable;
    }

    changeShowOldVehiclesOption() {
        this.options.showOldVehicles = !this.options.showOldVehicles;
    }

    changeUseVehicleClustersOption() {
        this.options.mergeAllVehicleClusters = false;
        this.options.useVehicleClusters = !this.options.useVehicleClusters;
    }

    changeMergeAllVehicleClustersOption() {
        this.options.mergeAllVehicleClusters = !this.options.mergeAllVehicleClusters;
    }

    changeSelectAllAgenciesOption() {
        this.selectOptions.allAgencies = !this.selectOptions.allAgencies;
    }

    changeSelectAllRoutesOption() {
        this.selectOptions.allRoutes = !this.selectOptions.allRoutes;
    }

    handleNewComponentToDisplay(componentToDisplay: MapComponentDisplayed) {
        this.componentDisplayed = componentToDisplay;
    }


    addAgencyIds(agencyIds: string[]) {
        this.selections.agencies = this.selections.agencies.concat(agencyIds);
    }

    removeAgencyIds(agencyIds: string[]) {
        this.selections.agencies = this.selections.agencies
            .filter((value) => !agencyIds.includes(value));

        this.selections.routes = this.selections.routes
            .filter((value) => !agencyIds.includes(value.agencyId));
        console.log(this.selections.routes);
    }

    addRouteId(routeId: RouteId) {
        this.selections.routes = this.selections.routes.concat([routeId]);
    }

    removeRouteId(routeId: RouteId) {
        this.selections.routes = this.selections.routes
            .filter((value) => value.agencyId !== routeId.agencyId
                || value.routeId !== routeId.routeId);
    }

    addVehicleSlected(vehicle: VehicleId) {
        this.componentDisplayed = MapComponentDisplayed.VehicleInfo;
        this.selections.vehicle = vehicle;
    }
}

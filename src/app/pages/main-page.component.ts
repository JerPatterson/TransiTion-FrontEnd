import { ChangeDetectorRef, Component, AfterContentChecked } from '@angular/core';
import { MapSelectionIdentifiers, MapRenderingOptions, RouteId, MapComponentDisplayed, MapSelectionOptions, VehicleId, StopId } from '@app/utils/component-interface';

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
        stops: [],
        stop: undefined,
        vehicle: undefined,
    }

    componentDisplayed = MapComponentDisplayed.None;


    constructor(private cdref: ChangeDetectorRef) {}

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    changeMapRenderingOptions(newRenderingOptions: MapRenderingOptions) {
        this.options = newRenderingOptions;
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

        this.selections.stops = this.selections.stops
            .filter((value) => !agencyIds.includes(value.agencyId));
    }

    addRouteId(routeId: RouteId) {
        this.selections.stops = [];
        this.selections.routes = this.selections.routes.concat([routeId]);
    }

    removeRouteId(routeId: RouteId) {
        this.selections.stops = [];
        this.selections.routes = this.selections.routes
            .filter((value) => value.agencyId !== routeId.agencyId
                || value.routeId !== routeId.routeId);
    }

    addStopId(stopId: StopId) {
        this.selections.stops = this.selections.stops.concat([stopId]);
    }

    removeStopId(routeId: StopId) {
        this.selections.stops = this.selections.stops
            .filter((value) => value.agencyId !== routeId.agencyId
                || value.stopId !== routeId.stopId);
    }

    addStopSelected(stop: StopId) {
        this.componentDisplayed = MapComponentDisplayed.StopInfo;
        this.selections.stop = stop;
    }

    hideStopInfoComponent() {
        this.componentDisplayed = MapComponentDisplayed.None;
        this.selections.stop = undefined;
    }

    addVehicleSlected(vehicle: VehicleId) {
        this.componentDisplayed = MapComponentDisplayed.VehicleInfo;
        this.selections.vehicle = vehicle;
    }

    hideVehicleInfoComponent() {
        this.componentDisplayed = this.selections.stop ?
            MapComponentDisplayed.StopInfo : MapComponentDisplayed.None;
        this.selections.vehicle = undefined;
    }
}

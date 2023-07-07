import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
    @Output() agencyListClick = new EventEmitter<boolean>();
    @Output() routeListClick = new EventEmitter<boolean>();
    @Output() stopListClick = new EventEmitter<boolean>();
    @Output() vehicleListClick = new EventEmitter<boolean>();

    agencyListSelected: boolean = false;
    routeListSelected: boolean = false;
    stopListSelected: boolean = false;
    vehicleListSelected: boolean = false;

    handleAgencyListClick() {
        this.routeListSelected = false;
        this.stopListSelected = false;
        this.vehicleListSelected = false;
        this.agencyListSelected = !this.agencyListSelected;
        this.agencyListClick.emit(this.agencyListSelected);
    }

    handleRouteListClick() {
        this.agencyListSelected = false;
        this.stopListSelected = false;
        this.vehicleListSelected = false;
        this.routeListSelected = !this.routeListSelected;
        this.routeListClick.emit(this.routeListSelected);
    }

    handleStopListClick() {
        this.agencyListSelected = false;
        this.routeListSelected= false;
        this.vehicleListSelected = false;
        this.stopListSelected = !this.stopListSelected;
        this.stopListClick.emit(this.stopListSelected);
    }

    handleVehicleListClick() {
        this.agencyListSelected = false
        this.routeListSelected= false;
        this.stopListSelected = false;
        this.vehicleListSelected = !this.vehicleListSelected;
        this.vehicleListClick.emit(this.vehicleListSelected);
    }
}

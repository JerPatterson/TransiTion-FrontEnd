import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
    @Input() agencyListSelected: boolean = false;
    @Input() routeListSelected: boolean = false;
    @Input() stopListSelected: boolean = false;
    @Input() vehicleListSelected: boolean = false;

    @Output() agencyListClick = new EventEmitter<boolean>();
    @Output() routeListClick = new EventEmitter<boolean>();
    @Output() stopListClick = new EventEmitter<boolean>();
    @Output() vehicleListClick = new EventEmitter<boolean>();

    handleAgencyListClick() {
        this.routeListSelected = false;
        this.stopListSelected = false;
        this.vehicleListSelected = false;
        this.agencyListSelected = !this.agencyListSelected;
        this.emitNewSelection();
    }

    handleRouteListClick() {
        this.agencyListSelected = false;
        this.stopListSelected = false;
        this.vehicleListSelected = false;
        this.routeListSelected = !this.routeListSelected;
        this.emitNewSelection();
    }

    handleStopListClick() {
        this.agencyListSelected = false;
        this.routeListSelected= false;
        this.vehicleListSelected = false;
        this.stopListSelected = !this.stopListSelected;
        this.emitNewSelection();
    }

    handleVehicleListClick() {
        this.agencyListSelected = false
        this.routeListSelected= false;
        this.stopListSelected = false;
        this.vehicleListSelected = !this.vehicleListSelected;
        this.emitNewSelection();
    }

    private emitNewSelection() {
        this.agencyListClick.emit(this.agencyListSelected);
        this.routeListClick.emit(this.routeListSelected);
        this.stopListClick.emit(this.stopListSelected);
        this.vehicleListClick.emit(this.vehicleListSelected);
    }
}

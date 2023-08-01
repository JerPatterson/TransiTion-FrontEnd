import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapComponentDisplayed } from '@app/utils/component-interface';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
    @Input() componentDisplayed = MapComponentDisplayed.None;
    @Output() newComponentToDisplay = new EventEmitter<MapComponentDisplayed>();

    handleAgencyListClick() {
        this.componentDisplayed = (this.componentDisplayed !== MapComponentDisplayed.AgencyList) ?
            MapComponentDisplayed.AgencyList : MapComponentDisplayed.None;
        this.emitNewSelection();
    }

    handleRouteListClick() {
        this.componentDisplayed = (this.componentDisplayed !== MapComponentDisplayed.RouteList) ?
            MapComponentDisplayed.RouteList : MapComponentDisplayed.None;
        this.emitNewSelection();
    }

    handleStopListClick() {
        this.componentDisplayed = (this.componentDisplayed !== MapComponentDisplayed.StopList) ?
            MapComponentDisplayed.StopList : MapComponentDisplayed.None;
        this.emitNewSelection();
    }

    handleVehicleListClick() {
        this.componentDisplayed = (this.componentDisplayed !== MapComponentDisplayed.VehicleList) ?
            MapComponentDisplayed.VehicleList : MapComponentDisplayed.None;
        this.emitNewSelection();
    }

    private emitNewSelection() {
        this.newComponentToDisplay.emit(this.componentDisplayed);
    }
}

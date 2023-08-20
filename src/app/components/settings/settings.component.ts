import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapRenderingOptions, MapSelectionOptions } from '@app/utils/component-interface';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
    @Input() renderingOptions!: MapRenderingOptions;
    @Input() selectOptions!: MapSelectionOptions;

    @Output() newRenderingOptions =  new EventEmitter<MapRenderingOptions>();

    setUseVehicleClustersOption(event: Event) {
        this.renderingOptions.useVehicleClusters = (event.target as HTMLInputElement).checked;
        this.newRenderingOptions.emit(this.renderingOptions);
    }

    setMergeAllVehicleClustersOption(event: Event) {
        this.renderingOptions.useVehicleClusters = true;
        this.renderingOptions.mergeAllVehicleClusters = (event.target as HTMLInputElement).checked;
        this.newRenderingOptions.emit(this.renderingOptions);
    }

    setShowOldVehicleOption(event: Event) {
        this.renderingOptions.showOldVehicles = (event.target as HTMLInputElement).checked;
        this.newRenderingOptions.emit(this.renderingOptions);
    }
}

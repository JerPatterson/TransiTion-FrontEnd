import { Component } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Filter } from 'src/app/enums/filter';

@Component({
    selector: 'app-select-tools',
    templateUrl: './select-tools.component.html',
    styleUrls: ['./select-tools.component.css']
})
export class StopSelectToolsComponent {
    constructor(readonly data: DataService) {}

    changeFilter(filter: string) {
        this.data.setFilter(filter);
    }

    onNewRouteTag(tag: string): void {
        this.data.routeTag = tag;
    }

    onNewStopTag(tag: string): void {
        this.data.stopTag = tag;
    }
}

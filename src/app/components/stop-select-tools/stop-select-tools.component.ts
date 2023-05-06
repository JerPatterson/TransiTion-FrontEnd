import { Component } from '@angular/core';

@Component({
    selector: 'app-stop-select-tools',
    templateUrl: './stop-select-tools.component.html',
    styleUrls: ['./stop-select-tools.component.css']
})
export class StopSelectToolsComponent {
    routeTag: string;
    stopTag: string;

    constructor() {
        this.routeTag = '';
        this.stopTag = ''
    }

    onNewRouteTag(tag: string): void {
        this.routeTag = tag;
    }

    onNewStopTag(tag: string): void {
        this.stopTag = tag;
    }
}

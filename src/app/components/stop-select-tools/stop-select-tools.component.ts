import { Component } from '@angular/core';

@Component({
    selector: 'app-stop-select-tools',
    templateUrl: './stop-select-tools.component.html',
    styleUrls: ['./stop-select-tools.component.css']
})
export class StopSelectToolsComponent {
    routeTag: string;

    constructor() {
        this.routeTag = '';
    }

    onNewRouteTag(tag: string) {
        this.routeTag = tag;
    }
}

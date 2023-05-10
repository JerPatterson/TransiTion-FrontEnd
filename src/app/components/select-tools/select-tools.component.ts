import { Component } from '@angular/core';
import { Filter } from 'src/app/enums/filter';

@Component({
    selector: 'app-select-tools',
    templateUrl: './select-tools.component.html',
    styleUrls: ['./select-tools.component.css']
})
export class StopSelectToolsComponent {
    filterType: Filter;
    routeTag: string;
    stopTag: string;

    constructor() {
        this.filterType = Filter.Default;
        this.routeTag = '';
        this.stopTag = ''
    }

    changeFilter(filter: string) {
        switch(filter) {
            default:
                this.filterType = Filter.Default;
                return;
            case Filter.Stops:
                this.filterType = Filter.Stops;
                return;
            case Filter.Routes:
                this.filterType = Filter.Routes;
                return;
        }
    }

    onNewRouteTag(tag: string): void {
        if (this.filterType === Filter.Routes) 
            this.stopTag = 'any';
        this.routeTag = tag;
    }

    onNewStopTag(tag: string): void {
        if (this.filterType === Filter.Stops) 
            this.routeTag = 'all';
        this.stopTag = tag;
    }
}

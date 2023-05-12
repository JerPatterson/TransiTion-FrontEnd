import { Injectable } from '@angular/core';
import { Filter } from '../enums/filter';
import { StaticDataService } from './static-data.service';
import { RealTimeDataService } from './real-time-data.service';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    filter: Filter;
    routeTag: string;
    stopTag: string;
    
    constructor() {
        this.filter = Filter.Default;
        this.routeTag = '';
        this.stopTag = '';
    }

    setFilter(type: string) {
        this.routeTag = '';
        this.stopTag = '';

        switch (type) {
            case Filter.Routes:
                this.filter = Filter.Routes;
                break;
            case Filter.Stops:
                this.filter = Filter.Stops;
                break;
            default:
                this.filter = Filter.Default;
        }
    }
}

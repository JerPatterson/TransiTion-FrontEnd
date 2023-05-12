import { Component } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Filter } from 'src/app/enums/filter';
import { DataService } from 'src/app/services/data.service';

@Component({
    selector: 'app-select-tools',
    templateUrl: './schedule-page.component.html',
    styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent {

    constructor(
        readonly data: DataService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
    ) {}

    changeFilter(filter: string): void {
        this.data.setFilter(filter);
        this.updateURLQueryParams();
    }

    changeRouteTag(route: string): void {
        this.data.routeTag = route;
        this.updateURLQueryParams();
    }

    changeStopTag(stop: string): void {
        this.data.stopTag = stop;
        this.updateURLQueryParams();
    }

    private updateURLQueryParams() {
        const extras = {
            relativeTo: this.route,
            queryParams: {},
            queryParamsHandling: '',
        } as NavigationExtras;

        const filter = this.data.filter;
        switch (filter) {
            case Filter.Routes:
                extras.queryParams = { filter, route: this.data.routeTag };
                break;
            case Filter.Stops:
                extras.queryParams = { filter, stop: this.data.stopTag };
                break;
            default:
                extras.queryParams = { filter, route: this.data.routeTag, stop: this.data.stopTag };
        }

        this.router.navigate([], extras);
    }
}

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/data.service';

@Component({
    selector: 'app-select-tools',
    templateUrl: './select-tools.component.html',
    styleUrls: ['./select-tools.component.css']
})
export class SelectToolsComponent {
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
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { 
                filter: this.data.filter,
                route: this.data.routeTag,
                stop: this.data.stopTag,
            },
            queryParamsHandling: 'merge',
        });
    }
}

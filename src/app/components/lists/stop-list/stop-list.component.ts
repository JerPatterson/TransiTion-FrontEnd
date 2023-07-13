import { Component, Input, OnInit } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StopListType } from '@app/utils/component-interface';

@Component({
    selector: 'app-stop-list',
    templateUrl: './stop-list.component.html',
    styleUrls: ['./stop-list.component.css']
})
export class StopListComponent implements OnInit {
    elements: StopListType[] = [];
    stopIds = new Set<string>();
    showAgencies = new Set<string>();
    showRoutes = new Set<string>();

    @Input() agencyIds: string[] = [];
    @Input() routeIds: string[] = [];
    @Input() selections: string[] = [];
    
    constructor(private staticDataService: StaticDataService) {}

    ngOnInit() {
        this.setStops();
        this.selections.forEach((stopId) => { this.stopIds.add(stopId) });
    }

    onAgencyClick(agencyId: string) {
        if (this.showAgencies.has(agencyId)) {
            this.showAgencies.delete(agencyId);
        } else {
            this.showAgencies.add(agencyId);
        }
    }

    onRouteClick(routeIds: string[]) {
        routeIds.forEach((routeId) => {
            if (this.showRoutes.has(routeId)) {
                this.showRoutes.delete(routeId);
            } else {
                this.showRoutes.add(routeId);
            }
        });
    }

    onStopClick(agencyId: string, stopId: string) {
        console.log(agencyId, stopId);
        this.selections.push(stopId);
    }
    
    private async setStops() {
        if (this.routeIds.length) {
            this.routeIds.forEach((routeId) => {
                console.log(routeId);
            });
        } else {
            this.elements = await Promise.all(this.agencyIds.map(async (agencyId) => {
                return {
                    agency: await this.staticDataService.getAgencyById(agencyId),
                    stops: (await this.staticDataService.getStopLocationsFromAgency(agencyId))
                        .sort((a, b) => a.stop_name.localeCompare(b.stop_name)),
                };
            }));
            console.log(this.elements);
        }
    }
}

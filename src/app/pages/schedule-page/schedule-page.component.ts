import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Time } from '@app/interfaces/time-concepts';
import { ScheduleService } from '@app/services/merge/schedule.service';

@Component({
    selector: 'app-schedule-page',
    templateUrl: './schedule-page.component.html',
    styleUrls: ['./schedule-page.component.css']
})
export class SchedulePageComponent {
    times: Time[] = [];
    tripId: string = "";

    agencyId: string | undefined;
    routeId: string | undefined;
    stopId: string | undefined;

    constructor(
        private route: ActivatedRoute,
        private scheduleService: ScheduleService,
    ) {
        this.setTimes();
    }

    async setTimes() {
        const agencyId = this.route.snapshot.paramMap.get('agency-name');
        const routeId = this.route.snapshot.paramMap.get('route-id');
        const stopId = this.route.snapshot.paramMap.get('stop-id');

        if (!agencyId || !stopId) return;
        this.agencyId = agencyId;
        this.stopId = stopId;

        if (routeId) {
            this.routeId = routeId;
            this.times = await this.scheduleService.getTimesFromStopOfRoute(agencyId, routeId, stopId);
        } else {
            this.times = await this.scheduleService.getTimesFromStop(agencyId, stopId);
        }

        this.tripId = this.times[0].tripId;
        this.routeId = this.times[0].routeId;
    }
}

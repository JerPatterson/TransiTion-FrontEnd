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
    tripId: string = '';

    agencyId: string = '';
    routeId: string = '';
    stopId: string = '';

    agencySelected: boolean = false;
    routeSelected: boolean = false;
    stopSelected: boolean = false;
    vehicleSelected: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private scheduleService: ScheduleService,
    ) {
        // this.setTimes();
    }

    async setTimes() {
        const agencyIdParam = this.route.snapshot.paramMap.get('agency-name');
        const routeIdParam = this.route.snapshot.paramMap.get('route-id');
        const stopIdParam = this.route.snapshot.paramMap.get('stop-id');

        this.agencyId = agencyIdParam ? agencyIdParam : '';
        this.routeId = routeIdParam ? routeIdParam : '';
        this.stopId = stopIdParam ? stopIdParam : '';

        if (!this.stopId) return;

        if (!this.routeId) {
            this.times = await this.scheduleService.getTimesFromStop(this.agencyId, this.stopId);
            this.routeId = this.times[0].routeId;
        } else {
            this.times = await this.scheduleService.getTimesFromStopOfRoute(this.agencyId, this.routeId, this.stopId);
        }

        this.tripId = this.times[0].tripId;
    }
}

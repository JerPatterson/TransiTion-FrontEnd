import { Component } from '@angular/core';
import { Time } from '@app/interfaces/time-concepts';
// import { ScheduleService } from '@app/services/merge/schedule.service';

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

    // constructor(private scheduleService: ScheduleService) {}

    // async setTimes() {
    //     if (!this.stopId) return;

    //     if (!this.routeId) {
    //         this.times = await this.scheduleService.getTimesFromStop(this.agencyId, this.stopId);
    //         this.routeId = this.times[0] ? this.times[0].routeId : '';
    //     } else {
    //         this.times = await this.scheduleService.getTimesFromStopOfRoute(this.agencyId, this.routeId, this.stopId);
    //     }

    //     this.tripId = this.times[0].tripId;
    // }

    displayAgencyList() {
        this.routeSelected = this.stopSelected = false;
        this.routeId = this.stopId = '';
        this.agencySelected = true;
        this.times = [];
    }

    displayRouteList() {
        this.agencySelected = this.stopSelected = false;
        this.routeSelected = true;
        this.times = [];
    }

    displayStopList() {
        this.agencySelected = this.routeSelected = false;
        this.stopSelected = true;
        this.times = [];
    }

    changeCurrentTripId(time: Time) {
        this.tripId = time.tripId;
        this.routeId = time.routeId;
    }

    changeCurrentAgencyId(value: string) {
        this.agencyId = value;
        this.agencySelected = false;
    }

    changeCurrentRouteId(value: string) {
        this.routeId = value;
        this.routeSelected = false;
    }

    changeCurrentStopId(value: string) {
        this.stopId = value;
        this.stopSelected = false;
        // this.setTimes();
    }
}

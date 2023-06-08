import { Injectable } from '@angular/core';
import { ScheduledTime, ShapePt, Trip } from '@app/interfaces/concepts';
import { StaticDataService } from '@app/services/static-data.service';
import { StaticStopDataService } from '@app/services/static-stop-data.service';
import { StaticServiceDataService } from '@app/services/static-service-data.service';

@Injectable({
    providedIn: 'root'
})
export class StaticTripDataService {
    
    constructor(
        private staticDataService: StaticDataService,
        private staticStopDataService: StaticStopDataService,
        private staticServiceDataService: StaticServiceDataService,
    ) {}

    async getTimesFromRoute(agencyId: string, routeId: string, stopId: string): Promise<ScheduledTime[]> {
        const times: ScheduledTime[] = [];
        const trips = await this.getTodayTripsFromRoute(agencyId, routeId);
    
        trips.forEach(trip => {
            trip.times.forEach(time => {
                times.push({ ...time, shapeId: trip.shapeId, tripId: trip.id, stopId, routeId });
            });
        });
        return times;
    }

    async getTimesFromStop(agencyId: string, stopId: string): Promise<ScheduledTime[]> {
        let times: ScheduledTime[] = [];
        const stop = await this.staticStopDataService.getStop(agencyId, stopId);

        for (let routeId of stop ? stop.routeIds : []) {
            times = times.concat(await this.getTimesFromStopOfRoute(agencyId, routeId, stopId));
        }
        return times;
    }

    async getTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<ScheduledTime[]> {
        const times: ScheduledTime[] = [];
        const trips = await this.getTodayTripsFromRoute(agencyId, routeId);
    
        trips.forEach(trip => {
            const time = trip.times.find(time => time.stopId === stopId);
            if (time) times.push({ ...time, shapeId: trip.shapeId, tripId: trip.id, stopId, routeId });
        });
        return times;
    }

    async getShapeOfTrip(agencyId: string, shapeId: string): Promise<ShapePt[]> {
        return (await this.staticDataService.getDocumentFromAgency(agencyId, `/trips/shapes/${shapeId}`)).data()?.arr as ShapePt[];
    }

    private async getTodayTripsFromRoute(agencyId: string, routeId: string): Promise<Trip[]> {
        return this.getTripsFromRoute(agencyId, routeId, await this.staticServiceDataService.getTodayServiceId(agencyId));
    }

    private async getTripsFromRoute(agencyId: string, routeId: string, serviceId: string): Promise<Trip[]> {
        return (await this.staticDataService.getDocumentFromAgency(agencyId, `trips/${routeId}/${serviceId}`)).data()?.arr as Trip[];
    }
}

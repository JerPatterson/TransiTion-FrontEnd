import { Injectable } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StaticStopDataService } from '@app/services/static/static-stop-data.service';
import { StaticServiceDataService } from '@app/services/static/static-service-data.service';
import { ShapePt, ScheduledTime, Trip } from '@app/interfaces/gtfs';

@Injectable({
    providedIn: 'root'
})
export class StaticTripDataService {
    
    constructor(
        private staticDataService: StaticDataService,
        private staticStopDataService: StaticStopDataService,
        private staticServiceDataService: StaticServiceDataService,
    ) {}

    async getTimesFromRoute(agencyId: string, routeId: string): Promise<ScheduledTime[]> {
        const times: ScheduledTime[] = [];
        const trips = await this.getTodayTripsFromRoute(agencyId, routeId);
    
        trips.forEach(trip => {
            trip.times.forEach(time => {
                times.push({ ...time, shapeId: trip.shapeId, tripId: trip.id, routeId });
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
            if (time) times.push({ ...time, shapeId: trip.shapeId, tripId: trip.id, routeId });
        });
        return times;
    }

    async getShapeOfTrip(agencyId: string, shapeId: string): Promise<ShapePt[]> {
        return (await this.staticDataService.getDocumentFromAgency(agencyId, `/trips/shapes/${shapeId}`)).data()?.arr as ShapePt[];
    }

    async getTodayTripsFromStop(agencyId: string, stopId: string): Promise<Trip[]> {
        let trips: Trip[] = [];
        const routeIds = (await this.staticStopDataService.getStop(agencyId, stopId))?.routeIds;
        routeIds?.forEach(async routeId => trips = trips.concat(await this.getTodayTripsFromRoute(agencyId, routeId)));
        
        return trips;
    }

    async getTodayTripsFromRoute(agencyId: string, routeId: string): Promise<Trip[]> {
        return this.getTripsFromRoute(agencyId, routeId, await this.staticServiceDataService.getTodayServiceId(agencyId));
    }

    private async getTripsFromRoute(agencyId: string, routeId: string, serviceId: string): Promise<Trip[]> {
        return (await this.staticDataService.getDocumentFromAgency(agencyId, `trips/${routeId}/${serviceId}`)).data()?.arr as Trip[];
    }
}

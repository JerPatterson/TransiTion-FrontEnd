import { Injectable } from '@angular/core';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StaticStopDataService } from '@app/services/static/static-stop-data.service';
import { StaticServiceDataService } from '@app/services/static/static-service-data.service';
import { ScheduledTime, ShapePt, Trip } from '@app/interfaces/gtfs';

@Injectable({
    providedIn: 'root'
})
export class StaticTripDataService {
    private tripIdToTrip: Map<string, Trip> = new Map(); // <tripId, Trip>
    
    constructor(
        private staticDataService: StaticDataService,
        private staticStopDataService: StaticStopDataService,
        private staticServiceDataService: StaticServiceDataService,
    ) {}

    async getShapeOfTrip(agencyId: string, shapeId: string): Promise<ShapePt[]> {
        return (await this.staticDataService.getDocumentFromAgency(agencyId, `/trips/shapes/${shapeId}`)).data()?.arr as ShapePt[];
    }

    async getTrip(tripId: string): Promise<Trip | undefined> {
        return this.tripIdToTrip.get(tripId);
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
        const doc = (await this.staticDataService.getDocumentFromAgency(agencyId, `trips/${routeId}/${serviceId}`)).data()?.arr as Trip[];
        const trips = doc.map(trip => { 
            return { 
                ...trip, times: new Map(Object.entries(trip.times)) as Map<string, ScheduledTime> 
            }; 
        });
        this.setTripsData(trips);

        return trips;
    }

    private async setTripsData(trips: Trip[]): Promise<void> {
        trips.forEach(trip => {
            this.tripIdToTrip.set(trip.id, trip);
        });
    }
}

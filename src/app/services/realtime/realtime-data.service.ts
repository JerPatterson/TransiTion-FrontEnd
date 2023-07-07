import { Injectable } from '@angular/core';
import { SERVER_URL } from '@app/utils/env';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

@Injectable({
    providedIn: 'root'
})
export class RealtimeDataService {
    async getVehiclesFromAgency(agencyId: string):
        Promise<GtfsRealtimeBindings.transit_realtime.IVehiclePosition[]> {
        const response = await fetch(`${SERVER_URL}/vehicles/${agencyId.toLowerCase()}`);
        return response.json();
    }

    async getVehiclesFromRoute(agencyId: string, routeId: string): 
        Promise<GtfsRealtimeBindings.transit_realtime.IVehiclePosition[]> {
        const response = await fetch(`${SERVER_URL}/vehicles/route/${agencyId.toLowerCase()}/${routeId}`);
        return response.json();
    }
}

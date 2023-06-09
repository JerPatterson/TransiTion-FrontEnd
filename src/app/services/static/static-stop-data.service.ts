import { Injectable } from '@angular/core';
import { StaticDataService } from './static-data.service';
import { Stop } from '@app/interfaces/gtfs';

@Injectable({
    providedIn: 'root'
})
export class StaticStopDataService {
    private agenciesStopIdToStop: Map<string, Map<string, Stop>> = new Map(); // <agencyId, <stopId, Stop>>
    private agenciesRouteIdToStopIds: Map<string, Map<string, string[]>> = new Map(); // <agencyId, <routeId, stopId[]>>

    constructor(private staticDataService: StaticDataService) {}

    async getStopsFromAgency(agencyId: string): Promise<Stop[]> {
        return this.getStopsData(agencyId);
    }

    async getStop(agencyId: string, stopId: string): Promise<Stop | undefined> {
        if (!this.agenciesStopIdToStop.has(agencyId))
            await this.setStopsData(agencyId, await this.getStopsData(agencyId));

        return this.agenciesStopIdToStop.get(agencyId)?.get(stopId);
    }

    async getStopsFromRoute(agencyId: string, routeId: string): Promise<Stop[]> {
        if (!this.agenciesStopIdToStop.has(agencyId))
            await this.setStopsData(agencyId, await this.getStopsData(agencyId));

        const stops: Stop[] = [];
        const stopIds = this.agenciesRouteIdToStopIds.get(agencyId)?.get(routeId);
        stopIds?.forEach(async stopId => {
            let stop = await this.getStop(agencyId, stopId);
            if (stop) stops.push(stop);
        });
    
        return stops;
    }

    private async setStopsData(agencyId: string, stops: Stop[]): Promise<void> {
        const agencyStopIdToStop: Map<string, Stop> = new Map();
        const agencyRouteIdToStopIds: Map<string, string[]> = new Map();

        stops.forEach(stop => {
            agencyStopIdToStop.set(stop.id, stop);
            stop.routeIds.forEach(routeId => {
                const stopIds = agencyRouteIdToStopIds.get(routeId);
                stopIds?.push(stop.id);
                agencyRouteIdToStopIds.set(routeId, stopIds ? stopIds : [stop.id]);
            });
        });

        this.agenciesStopIdToStop.set(agencyId, agencyStopIdToStop);
        this.agenciesRouteIdToStopIds.set(agencyId, agencyRouteIdToStopIds);
    }

    private async getStopsData(agencyId: string): Promise<Stop[]> {
        const storedContent = sessionStorage.getItem(`${agencyId}/stops`);
        if (storedContent) return JSON.parse(storedContent) as Stop[];

        const content = (await this.staticDataService.getDocumentFromAgency(agencyId, 'stops')).data()?.arr as Stop[];
        sessionStorage.setItem(`${agencyId}/stops`, JSON.stringify(content));
    
        return content;
    }
}

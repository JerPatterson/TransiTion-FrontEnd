import { Injectable } from '@angular/core';
import { AgencyDto, RouteDto, ShapeDto, StopDto, TimeDto, TripDto } from '@app/utils/dtos';
import { SERVER_URL } from '@app/utils/env';

@Injectable({
    providedIn: 'root'
})
export class StaticDataService {
    constructor() {}

    async getAgencies(): Promise<AgencyDto[]> {
        const ssAgencies = sessionStorage.getItem('agencies');
        if (ssAgencies) return JSON.parse(ssAgencies);
        const response = await fetch(`${SERVER_URL}/agencies`);
        const agencies = await response.json();
        sessionStorage.setItem('agencies', JSON.stringify(agencies));
        return agencies;
    }

    async getAgencyById(agencyId: string): Promise<AgencyDto> {
        return (await this.getAgencies()).find((agency) => agency.agency_id === agencyId) as AgencyDto;
    }

    async getRoutes(agencyId: string): Promise<RouteDto[]> {
        agencyId = agencyId.toLowerCase();
        const ssRoutes = sessionStorage.getItem(`routes/${agencyId}`);
        if (ssRoutes) return JSON.parse(ssRoutes);
        const response = await fetch(`${SERVER_URL}/routes/${agencyId}`);
        const routes = await response.json();
        sessionStorage.setItem(`routes/${agencyId}`, JSON.stringify(routes));
        return routes;
    }

    async getRouteById(agencyId: string, routeId: string): Promise<RouteDto | undefined> {
        return (await this.getRoutes(agencyId)).find((route) => route.route_id === routeId);
    }

    async getShapeById(agencyId: string, shapeId: string): Promise<ShapeDto[]> {
        agencyId = agencyId.toLowerCase();
        const ssShape = localStorage.getItem(`shapes/${agencyId}/${shapeId}`);
        if (ssShape) return JSON.parse(ssShape);
        const response = await fetch(`${SERVER_URL}/shapes/${agencyId}/${shapeId}`);
        const shape = (await response.json()).shapes;
        while (true) {
            try {
                localStorage.setItem(`shapes/${agencyId}/${shapeId}`, JSON.stringify(shape));
                break;
            } catch {
                const key = localStorage.key(0);
                if (key) localStorage.removeItem(key);
            }
        }
        return shape;
    }

    async getTripById(agencyId: string, tripId: string): Promise<TripDto> {
        const response = await fetch(`${SERVER_URL}/trips/${agencyId}/${tripId}`);
        return response.json();
    }

    async getTodayTripsFromStop(agencyId: string, stopId: string): Promise<TripDto[]> {
        const response = await fetch(`${SERVER_URL}/trips/stop/today/${agencyId}/${stopId}`);
        return response.json();
    }

    async getTodayTripsFromRoute(agencyId: string, routeId: string): Promise<TripDto[]> {
        const response = await fetch(`${SERVER_URL}/trips/route/today/${agencyId}/${routeId}`);
        return response.json();
    }

    async getStopsFromAgency(agencyId: string): Promise<StopDto[]> {
        agencyId = agencyId.toLowerCase();
        const ssStops = sessionStorage.getItem(`stops/${agencyId}`);
        if (ssStops) return JSON.parse(ssStops);
        const response = await fetch(`${SERVER_URL}/stops/${agencyId}`);
        const stops = await response.json();
        sessionStorage.setItem(`stops/${agencyId}`, JSON.stringify(stops));
        return stops;
    }

    async getStopById(agencyId: string, stopId: string): Promise<StopDto> {
        const response = await fetch(`${SERVER_URL}/stops/${agencyId}/${stopId}`);
        return response.json();
    }

    async getStopByIds(agencyId: string, stopIds: string[]): Promise<StopDto[]> {
        const wantedStopIds = new Set(stopIds);
        const stops = await this.getStopsFromAgency(agencyId);
        return stops.filter((stop) => wantedStopIds.has(stop.stop_id));
    }

    async getStopsFromRoute(agencyId: string, routeId: string): Promise<StopDto[]> {
        const response = await fetch(`${SERVER_URL}/stops/route/${agencyId}/${routeId}`);
        return response.json();
    }

    async getStopsFromTrip(agencyId: string, tripId: string): Promise<StopDto[]> {
        const response = await fetch(`${SERVER_URL}/stops/trip/${agencyId}/${tripId}`);
        return response.json();
    }

    async getTimesFromTrip(agencyId: string, tripId: string): Promise<TimeDto[]> {
        const response = await fetch(`${SERVER_URL}/times/${agencyId}/${tripId}`);
        return response.json();
    }

    async getTimesFromStop(agencyId: string, stopId: string): Promise<TimeDto[]> {
        const response = await fetch(`${SERVER_URL}/times/stop/today/${agencyId}/${stopId}`);
        return response.json();
    }

    async getTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<TimeDto[]> {
        const response = await fetch(`${SERVER_URL}/times/route/stop/today/${agencyId}/${routeId}/${stopId}`);
        return response.json();
    }
}

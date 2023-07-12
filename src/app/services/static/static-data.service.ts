import { Injectable } from '@angular/core';
import { AgencyDto, RouteDto, ShapeDto, StopDto, StopLocationDto, TimeDto, TripDto } from '@app/utils/dtos';
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

    async getAgencyById(agencyId: string): Promise<AgencyDto | undefined> {
        return (await this.getAgencies()).find((agency) => agency.agency_id === agencyId);
    }

    async getRoutes(agencyId: string): Promise<RouteDto[]> {
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
        const ssShape = sessionStorage.getItem(`shapes/${agencyId}/${shapeId}`);
        if (ssShape) return JSON.parse(ssShape);
        const response = await fetch(`${SERVER_URL}/shapes/${agencyId}/${shapeId}`);
        const shape = await response.json();
        sessionStorage.setItem(`shapes/${agencyId}/${shapeId}`, JSON.stringify(shape));
        return shape;
    }

    async getTrip(agencyId: string, tripId: string): Promise<TripDto> {
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

    async getStopLocationsFromAgency(agencyId: string): Promise<StopLocationDto[]> {
        const ssStopLocations = localStorage.getItem(`stops/${agencyId}`);
        if (ssStopLocations) return JSON.parse(ssStopLocations);
        const response = await fetch(`${SERVER_URL}/stops/${agencyId}`);
        const stopLocations = await response.json();
        localStorage.setItem(`stops/${agencyId}`, stopLocations);
        return stopLocations;
    }

    async getStopById(agencyId: string, stopId: string): Promise<StopDto> {
        const response = await fetch(`${SERVER_URL}/stops/${agencyId}/${stopId}`);
        return response.json();
    }

    async getStopsFromRoute(agencyId: string, routeId: string): Promise<StopDto[]> {
        const response = await fetch(`${SERVER_URL}/stops/route/${agencyId}/${routeId}`);
        return response.json();
    }

    async getStopsFromTrip(agencyId: string, tripId: string): Promise<StopDto[]> {
        const response = await fetch(`${SERVER_URL}/stops/trip/${agencyId}/${tripId}`);
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

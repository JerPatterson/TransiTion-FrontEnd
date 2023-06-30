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
        sessionStorage.setItem('agencies', agencies);
        return agencies;
    }

    async getRoutes(agencyId: string): Promise<RouteDto[]> {
        const ssRoutes = sessionStorage.getItem(`routes/${agencyId}`);
        if (ssRoutes) return JSON.parse(ssRoutes);
        const response = await fetch(`${SERVER_URL}/routes/${agencyId}`);
        const routes = await response.json();
        sessionStorage.setItem(`routes/${agencyId}`, routes);
        return routes;
    }

    async getRoutesById(agencyId: string, routeId: string): Promise<RouteDto | undefined> {
        return (await this.getRoutes(agencyId)).find((route) => route.route_id === routeId);
    }

    async getShapeById(agencyId: string, shapeId: string): Promise<ShapeDto[]> {
        const ssShape = sessionStorage.getItem(`shapes/${agencyId}/${shapeId}`);
        if (ssShape) return JSON.parse(ssShape);
        const response = await fetch(`${SERVER_URL}/shapes/${agencyId}/${shapeId}`);
        const shape = await response.json();
        sessionStorage.setItem(`shapes/${agencyId}/${shapeId}`, shape);
        return shape;
    }

    async getStopsFromAgency(agencyId: string): Promise<StopDto[]> {
        const res = await fetch(`${SERVER_URL}/stops/${agencyId}`);
        return res.json();
    }

    async getStop(agencyId: string, stopId: string): Promise<StopDto> {
        const res = await fetch(`${SERVER_URL}/stops/${agencyId}/${stopId}`);
        return res.json();
    }

    async getStopsFromRoute(agencyId: string, routeId: string): Promise<StopDto[]> {
        const res = await fetch(`${SERVER_URL}/stops/route/${agencyId}/${routeId}`);
        return res.json();
    }

    async getStopsFromTrip(agencyId: string, tripId: string): Promise<StopDto[]> {
        const res = await fetch(`${SERVER_URL}/stops/trip/${agencyId}/${tripId}`);
        return res.json();
    }

    async getTrip(agencyId: string, tripId: string): Promise<TripDto> {
        const res = await fetch(`${SERVER_URL}/trips/${agencyId}/${tripId}`);
        return res.json();
    }

    async getTodayTripsFromStop(agencyId: string, stopId: string): Promise<TripDto[]> {
        const res = await fetch(`${SERVER_URL}/trips/stop/today/${agencyId}/${stopId}`);
        return res.json();
    }

    async getTodayTripsFromRoute(agencyId: string, routeId: string): Promise<TripDto[]> {
        const res = await fetch(`${SERVER_URL}/trips/route/today/${agencyId}/${routeId}`);
        return res.json();
    }

    async getTimesFromStop(agencyId: string, stopId: string): Promise<TimeDto[]> {
        const res = await fetch(`${SERVER_URL}/times/stop/today/${agencyId}/${stopId}`);
        return res.json();
    }

    async getTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<TimeDto[]> {
        const res = await fetch(`${SERVER_URL}/times/route/stop/today/${agencyId}/${routeId}/${stopId}`);
        return res.json();
    }
}

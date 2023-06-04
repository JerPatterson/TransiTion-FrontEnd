import { RouteType } from '@app/enums/attributes';

export interface Route {
    id: string;
    destination: string;
    type: RouteType;
    color: string;
    nightOnly: boolean;
    accessible: boolean;
}

export interface Location {
    lon: number;
    lat: number;
}

export interface Stop {
    id: string;
    code: string;
    name: string;
    location: Location;
    hasShelter: boolean;
    hasDisplay: boolean;
    accessible: boolean;
    routeIds: string[];
    tripIds: string[];
}

export interface Time {
    routeId: string;
    tripId: string;
    epochTime: number;
    minutesAhead: number;
    secondsAhead: number;
}

export interface ScheduledTime {
    scheduledTime: string;
    stopId: string
}

export interface Trip {
    routeId: string;
    destinationHeadSign: string;
    serviceId: string;
    wheelchairAccessibility: number;
    times: ScheduledTime[];
}

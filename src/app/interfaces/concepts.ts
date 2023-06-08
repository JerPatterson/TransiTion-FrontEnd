import { DropOffType, PickupType, RouteType, DateException } from '@app/enums/attributes';

export interface Route {
    id: string;
    name: string;
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
    name: string;
    location: Location;
    hasShelter: boolean;
    hasDisplay: boolean;
    accessible: boolean;
    routeIds: string[];
    tripIds: string[];
}

export interface Time {
    stopId: string;
    routeId: string;
    stEpochTime: number;
    stMinutesAhead: number;
    stSecondsAhead: number;
    rtEpochTime?: number;
    rtMinutesAhead?: number;
    rtSecondsAhead?: number;
}

export interface PredictedTime {
    routeId: string;
    tripId: string;
    epochTime: number;
    minutesAhead: number;
    secondsAhead: number;
}

export interface ScheduledTime {
    tripId: string;
    stopId: string;
    routeId: string;
    scheduledTime: string;
    pickupType: PickupType;
    dropOffType: DropOffType;
    sequenceNb: number;
}

export interface Trip {
    id: string;
    shapeId: string;
    destination: string;
    wheelchairAccessibility: number;
    times: ScheduledTime[];
}

export interface CalendarElement {
    startDate: { seconds: number };
    endDate: { seconds: number };
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    sathurday: boolean;
    sunday: boolean;
    serviceId: string;
}

export interface CalendarExceptionElement {
    date: { seconds: number };
    exceptionType: DateException;
    serviceId: string;
}

export interface ShapePt {
    location: Location;
    sequenceNb: number;
}

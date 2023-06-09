import { DateException, DropOffType, PickupType, RouteType } from "@app/enums/attributes";

export interface Location {
    lon: number;
    lat: number;
}

export interface Route {
    id: string;
    name: string;
    type: RouteType;
    color: string;
    nightOnly: boolean;
    accessible: boolean;
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

export interface ShapePt {
    location: Location;
    sequenceNb: number;
}

export interface Trip {
    id: string;
    shapeId: string;
    destination: string;
    wheelchairAccessibility: number;
    times: Map<string, ScheduledTime>;
}

export interface ScheduledTime {
    scheduledTime: string;
    pickupType: PickupType;
    dropOffType: DropOffType;
    sequenceNb: number;
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

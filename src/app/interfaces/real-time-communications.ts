import { Location } from "./transit-concept";

export interface Agency {
    tag: string;
    title: string;
    regionTitle: string | null;
}

export interface Route {
    tag: string;
    title: string;
}

export interface Stop {
    tag: string;
    title: string;
    location: Location;
}

export interface Time {
    seconds: number;
    minutes: number;
    epochTime: number;
    isDeparture: boolean;
}
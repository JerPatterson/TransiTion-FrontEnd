import { Location } from "./transit-concept";

export interface Agency {
    tag: string;
    title: string;
    regionTitle: string | null;
}

export interface rtRoute {
    tag: string;
    title: string;
}

export interface rtStop {
    tag: string;
    title: string;
    location: Location;
}

export interface rtTime {
    seconds: number;
    minutes: number;
    epochTime: number;
    isDeparture: boolean;
}
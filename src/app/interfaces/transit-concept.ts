export interface Location {
    latitude: number;
    longitude: number;
}

export interface Stop {
    id: number;
    name: string;
    location: Location;
}

export interface Time {
    epochTime: number;
    minutesAhead: number;
    secondsAhead: number;
    stopTitle?: string | null;
    routeTitle?: string | null;
}

export interface Agency {
    tag: string;
    title: string;
    regionTitle: string | null;
}

export interface Route {
    tag: string;
    title: string;
}

export interface Location {
    latitude: number | null;
    longitude: number | null;
}

export interface Stop {
    tag: string;
    title: string;
    location: Location;
}

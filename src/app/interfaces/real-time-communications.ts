export interface Agency {
    tag: string;
    title: string;
    regionTitle: string | null;
}

export interface rtRoute {
    tag: string;
    title: string;
}

export interface rtRouteConfig {
    tag: string;
    title: string;
    latitudeMin: number;
    latitudeMax: number;
    longitudeMin: number;
    longitudeMax: number;
}

export interface rtStop {
    tag: string;
    title: string;
    latitude: number;
    longitude: number;
}

export interface rtTime {
    seconds: number;
    minutes: number;
    epochTime: number;
    isDeparture: boolean;
}
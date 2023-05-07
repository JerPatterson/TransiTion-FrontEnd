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

export interface Time {
    seconds: number;
    minutes: number;
    epochTime: number;
    isDeparture: boolean;
}

export interface StaticTime {
    trip_id: string;
    arrival_time: string;
    departure_time: string;
    stop_id: string;
    stop_sequence: string;
    pickup_type: string;
    drop_off_type: string;
}

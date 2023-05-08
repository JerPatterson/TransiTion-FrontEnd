export interface StaticTrip {
    route_id: string;
    service_id: string;
    trip_id: string;
    shape_id: string;
    wheelchair_accessible: string;
    trip_headsign: string;
}

export interface StaticStop {
    stop_id: string;
    stop_code: string;
    stop_name: string;
    stop_lon: number;
    stop_lat: number;
    location_type: string;
    stop_display: string;
    wheelchair_boarding: string;
    stop_abribus: string;
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

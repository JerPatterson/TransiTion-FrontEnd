export interface Calendar {
    service_id: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    start_date: string;
    end_date: string;
}

export interface stTrip {
    route_id: string;
    service_id: string;
    trip_id: string;
    shape_id: string;
    wheelchair_accessible: string;
    trip_headsign: string;
}

export interface stStop {
    stop_id: string;
    stop_code: string;
    stop_name: string;
    stop_lon: string;
    stop_lat: string;
    location_type: string;
    stop_display: string;
    wheelchair_boarding: string;
    stop_abribus: string;
}

export interface stTime {
    trip_id: string;
    arrival_time: string;
    departure_time: string;
    stop_id: string;
    stop_sequence: string;
    pickup_type: string;
    drop_off_type: string;
}

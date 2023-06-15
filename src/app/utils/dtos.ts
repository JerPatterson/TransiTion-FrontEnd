import { LocationType, WheelchairBoardingType } from './enums';

export interface AgencyDto {
  agency_id: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang?: string;
  agency_phone?: string;
  agency_fare_url?: string;
  agency_email?: string;
}

export interface StopDto {
  stop_id: string;
  stop_code?: string;
  stop_name: string;
  stop_desc?: string;
  stop_lat: number;
  stop_lon: number;
  zone_id?: string;
  stop_url?: string;
  location_type: LocationType;
  parent_station?: string;
  stop_timezone?: string;
  wheelchair_boarding?: WheelchairBoardingType;
  level_id?: string;
  platform_code?: string;
  stop_shelter: boolean;
  stop_display: boolean;
}

export interface RouteDto {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_desc?: string;
  route_type: number;
  route_url?: string;
  route_color?: string;
  route_text_color?: string;
  route_sort_order?: number;
  continuous_pickup?: number;
  continuous_drop_off?: number;
  wheelchair_boarding?: number;
}

export interface TripDto {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign: string;
  trip_short_name?: string;
  direction_id?: number;
  block_id?: string;
  shape_id: string;
  wheelchair_accessible?: number;
  bikes_allowed?: number;
}

export interface TimeDto {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: number;
  stop_headsign?: string;
  pickup_type?: number;
  drop_off_type?: number;
  continuous_pickup?: number;
  continuous_drop_off?: number;
  shape_dist_traveled?: number;
  timepoint?: number;
  trip?: TripDto;
  stop?: StopDto;
}

export interface ShapeDto {
  agency_id: string;
  shape_id: string;
  shape_pt_lat: number;
  shape_pt_lon: number;
  shape_pt_sequence: number;
  shape_dist_traveled?: number;
}

export interface CalendarDto {
  agency_id: string;
  service_id: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  start_date: number;
  end_date: number;
}

export interface CalendarDateDto {
  agency_id: string;
  service_id: string;
  date: number;
  exception_type: number;
}

export interface AreaDto {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface DateDto {
  year: number;
  month: number;
  day: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

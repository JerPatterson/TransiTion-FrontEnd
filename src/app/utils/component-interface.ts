import { AgencyDto, RouteDto, StopLocationDto } from "./dtos";

export interface RouteListType {
    agency?: AgencyDto; 
    routes: RouteDto[][];
}

export interface StopListType {
    agency?: AgencyDto;
    stops: StopLocationDto[];
}
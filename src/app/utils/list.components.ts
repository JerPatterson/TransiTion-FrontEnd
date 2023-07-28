import { AgencyDto, RouteDto, StopLocationDto } from "./dtos";

export interface AgencyRouteElement {
    agency: AgencyDto; 
    routes: RouteDto[];
}

export interface AgencyStopElement {
    agency: AgencyDto;
    stops: StopLocationDto[];
}
import { AgencyDto, RouteDto, StopDto } from "./dtos";

export interface AgencyRoutesElement {
    agency: AgencyDto; 
    routes: RouteDto[];
}

export interface AgencyStopsElement {
    agency: AgencyDto;
    stops: StopDto[];
}

export interface AgencyRouteStopsElement {
    route: RouteDto;
    stops: StopDto[];
}
import { AgencyDto, RouteDto, StopDto } from "./dtos";

export interface AgencyRouteElement {
    agency: AgencyDto; 
    routes: RouteDto[];
}

export interface AgencyStopElement {
    agency: AgencyDto;
    stops: StopDto[];
}
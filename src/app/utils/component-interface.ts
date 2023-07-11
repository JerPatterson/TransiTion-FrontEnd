import { AgencyDto, RouteDto } from "./dtos";

export interface RouteListType {
    agency?: AgencyDto; 
    routes: RouteDto[][];
}
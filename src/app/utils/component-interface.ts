import { AgencyDto, RouteDto, StopLocationDto } from "./dtos";

export interface MapRenderingOptions {
    darkModeEnable: boolean;
    showOldVehicles: boolean;
    useVehicleClusters: boolean;
    mergeAllVehicleClusters: boolean;
};

export interface RouteListType {
    agency?: AgencyDto; 
    routes: RouteDto[][];
}

export interface StopListType {
    agency?: AgencyDto;
    stops: StopLocationDto[];
}
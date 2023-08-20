export interface MapRenderingOptions {
    darkModeEnable: boolean;
    showOldVehicles: boolean;
    useVehicleClusters: boolean;
    mergeAllVehicleClusters: boolean;
}

export interface MapSelectionOptions {
    allAgencies: boolean;
    allRoutes: boolean;
}

export interface MapSelectionIdentifiers {
    agencies: string[];
    routes: RouteId[],
    stops: StopId[];
    stop?: StopId;
    vehicle?: VehicleId;
}

export enum MapComponentDisplayed {
    None,
    AgencyList,
    RouteList,
    StopList,
    VehicleList,
    StopInfo,
    VehicleInfo,
    Settings,
}

export interface RouteId {
    agencyId: string;
    routeId: string;
}

export interface VehicleId {
    agencyId: string;
    vehicleId: string;
}

export interface StopId {
    agencyId: string;
    stopId: string;
}

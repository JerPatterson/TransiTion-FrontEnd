import { RouteDto, TripDto } from "./dtos";
import { AgencyStyle } from "./styles";

export interface VehicleAttributes {
    trip?: TripDto;
    route?: RouteDto;
    style?: AgencyStyle;

    bearing: number;
    iconLink: string;
    lastSeenString: string;
    speedKmHrString: string;
    occupancyString: string;
    stopStatusString: string;
    congestionLevelString: string;
    scheduleRelationshipString: string;
}
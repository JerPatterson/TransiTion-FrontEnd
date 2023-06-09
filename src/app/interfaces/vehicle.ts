import { Location } from '@app/interfaces/gtfs'

export interface Vehicle {
    id: number;
    speed: number;
    dirTag: string;
    location: Location;
    secsSinceReport: number;
    heading: number;
}

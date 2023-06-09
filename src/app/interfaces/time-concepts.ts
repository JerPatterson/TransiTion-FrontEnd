export interface Time {
    stopId: string;
    routeId: string;
    tripId: string;
    shapeId: string;
    stEpochTime: number;
    stMinutesAhead: number;
    stSecondsAhead: number;
    rtEpochTime?: number;
    rtMinutesAhead?: number;
    rtSecondsAhead?: number;
}

export interface PredictedTime {
    routeId: string;
    tripId: string;
    epochTime: number;
    minutesAhead: number;
    secondsAhead: number;
}

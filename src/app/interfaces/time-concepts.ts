export interface Time {
    tripId: string;
    routeId: string;
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

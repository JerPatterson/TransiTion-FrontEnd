import { Injectable } from '@angular/core';
import { Time } from '../interfaces/real-time-communications';
import { StaticStop, StaticTime, StaticTrip } from '../interfaces/static-time-communication';
import { ScheduleType } from '../enums/static-data';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS } from '../constants/time';

@Injectable({
    providedIn: 'root'
})
export class StaticDataService {
    private agency = 'stl'

    private trips: StaticTrip[];
    private stops: StaticStop[];
    private times: StaticTime[];

    constructor() {
        this.trips = [];
        this.stops = [];
        this.times = [];
        this.initLists();
    }

    async getTimeExpectedList(routeTag: string, stopTag: string): Promise<Time[]> {
        return this.getTimeScheduleList(routeTag, stopTag, ScheduleType.Week);
    }
    
    async getTimeScheduleList(routeTag: string, stopTag: string, _: ScheduleType): Promise<Time[]> {
        return this.times.filter((time) => time.trip_id.includes(routeTag) && time.stop_id.includes(stopTag))
            .map((time) => {
                const value = this.getTimeToWaitInMS(time.arrival_time);
                return {
                    epochTime: value,
                    minutes: Math.floor(value / (ONE_MINUTE_IN_SEC * ONE_SEC_IN_MS)),
                    seconds:  Math.floor(value / (ONE_SEC_IN_MS)),
                    isDeparture: false,
                }
            });
    }

    private getTimeToWaitInMS(time: string): number {
        const [hours, minutes, _] = time.split(':');
        return (Number(hours) * ONE_HOUR_IN_MIN + Number(minutes)) * ONE_MINUTE_IN_SEC * ONE_SEC_IN_MS;
    }

    private async initLists() {
        await this.readTripsFile();
        await this.readStopsFile();
        await this.readStopTimesFile();
    }

    private async readTripsFile(): Promise<void> {
        if (!this.trips.length) this.trips = await this.readFile(`./assets/trips.${this.agency}.txt`) as StaticTrip[];
    }

    private async readStopsFile(): Promise<void> {
        if (!this.stops.length) this.stops = await this.readFile(`./assets/stops.${this.agency}.txt`) as StaticStop[];
    }

    private async readStopTimesFile(): Promise<void> {
        if (!this.times.length) this.times = await this.readFile(`./assets/stop_times.${this.agency}.txt`) as StaticTime[];
    }

    private async readFile(path: string): Promise<Object[]> {
        const VALUE_DELIMITER = ',';
        const LINE_DELIMITER = '\r\n';

        const content = await fetch(path).then((res) => res.text());
        const parameters = content.split(LINE_DELIMITER, 1)[0].split(VALUE_DELIMITER);

        return content.split(LINE_DELIMITER).slice(1).map((line) => {
            const result = Object();
            line.split(VALUE_DELIMITER).forEach((value, index) => {
                result[parameters[index]] = value;
            });
            return result;
        });
    }
}

import { Injectable } from '@angular/core';
import { Time } from '../interfaces/transit-concept'
import { Calendar, stStop, stTime, stTrip } from '../interfaces/static-time-communication';
import { Day } from '../enums/day';
import { VALUE_DELIMITER, LINE_DELIMITER } from '../constants/csv';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS } from '../constants/time';

@Injectable({
    providedIn: 'root'
})
export class StaticDataService {
    private agency = 'stl'

    private calendar: Calendar[];
    private trips: stTrip[];
    private stops: stStop[];
    private times: stTime[];

    constructor() {
        this.calendar = [];
        this.trips = [];
        this.stops = [];
        this.times = [];
        this.initLists();
    }

    async getTimeListFromRouteStop(routeTag: string, stopTag: string): Promise<Time[]> {
        const now = Date.now();
        return (await this.getStaticTimeListFromRouteStop(routeTag, stopTag))
            .map(trip => {
                const timeAhead = this.getTimeAheadInMilliseconds(trip.arrival_time);
                return { 
                    epochTime: now + timeAhead,
                    secondsAhead: Math.floor(timeAhead / ONE_SEC_IN_MS),
                    minutesAhead: Math.floor(timeAhead / (ONE_MINUTE_IN_SEC * ONE_SEC_IN_MS)),
                } 
            })
            .filter(time => time.epochTime > now)
            .sort((a, b) => a.epochTime - b.epochTime);
    }

    async getTimeListFromRoute(routeTag: string): Promise<Time[]> {
        const now = Date.now();
        return (await this.getStaticTimeListFromRoute(routeTag))
            .map(trip => {
                const timeAhead = this.getTimeAheadInMilliseconds(trip.arrival_time);
                return { 
                    epochTime: now + timeAhead,
                    secondsAhead: Math.floor(timeAhead / ONE_SEC_IN_MS),
                    minutesAhead: Math.floor(timeAhead / (ONE_MINUTE_IN_SEC * ONE_SEC_IN_MS)),
                } 
            })
            .filter(time => time.epochTime > now)
            .sort((a, b) => a.epochTime - b.epochTime);
    }

    private async getStaticTimeListFromRouteStop(routeTag: string, stopTag: string): Promise<stTime[]> {
        const today = new Date(Date.now()).getDay();
        const tripIds = (await this.getTripListFromRoute(routeTag, today)).map(trip => trip.trip_id);
        return this.times.filter(time => time.stop_id?.includes(stopTag) && tripIds.includes(time.trip_id));
    }

    private async getStaticTimeListFromRoute(routeTag: string): Promise<stTime[]> {
        const today = new Date(Date.now()).getDay();
        const tripIds = (await this.getTripListFromRoute(routeTag, today)).map(trip => trip.trip_id);
        return this.times.filter(time => tripIds.includes(time.trip_id));
    }

    private async getTripListFromRoute(routeTag: string, day: number): Promise<stTrip[]> {
        const serviceIds = this.getServiceIdsFromDay(day);
        return this.trips.filter(trip => trip.route_id?.includes(routeTag) && serviceIds.includes(trip.service_id));
    }

    private getTimeAheadInMilliseconds(time: string): number {
        const now = new Date(Date.now());
        const [hr, min, sec] = time.split(':').map(value => Number(value));
        const [nHr, nMin, nSec] = [now.getHours(), now.getMinutes(), now.getSeconds()];
        return this.convertTimeToMilliseconds(hr, min, sec) - this.convertTimeToMilliseconds(nHr, nMin, nSec);
    }

    private convertTimeToMilliseconds(hours: number, minutes: number, seconds: number): number {
        return ((hours * ONE_HOUR_IN_MIN + minutes) * ONE_MINUTE_IN_SEC + seconds) * ONE_SEC_IN_MS;
    }

    private getServiceIdsFromDay(dayOfTheWeek: number): string[] {
        const ACTIVE = '1';
        switch (dayOfTheWeek) {
            case Day.Sunday:
                return this.calendar.filter(column => column.sunday === ACTIVE).map(row => row.service_id);
            case Day.Monday:
                return this.calendar.filter(column => column.monday === ACTIVE).map(row => row.service_id);
            case Day.Tuesday:
                return this.calendar.filter(column => column.tuesday === ACTIVE).map(row => row.service_id);
            case Day.Wednesday:
                return this.calendar.filter(column => column.wednesday === ACTIVE).map(row => row.service_id);
            case Day.Thursday:
                return this.calendar.filter(column => column.thursday === ACTIVE).map(row => row.service_id);
            case Day.Friday:
                return this.calendar.filter(column => column.friday === ACTIVE).map(row => row.service_id);
            case Day.Saturday:
                return this.calendar.filter(column => column.saturday === ACTIVE).map(row => row.service_id);
            default:
                return [];
        }
    }

    private async initLists() {
        await this.readCalendarFile();
        await this.readTripsFile();
        await this.readStopsFile();
        await this.readStopTimesFile();
    }

    private async readCalendarFile(): Promise<void> {
        if (!this.calendar.length) this.calendar = await this.readFile(`./assets/calendar.${this.agency}.txt`) as Calendar[];
    }

    private async readTripsFile(): Promise<void> {
        if (!this.trips.length) this.trips = await this.readFile(`./assets/trips.${this.agency}.txt`) as stTrip[];
    }

    private async readStopsFile(): Promise<void> {
        if (!this.stops.length) this.stops = await this.readFile(`./assets/stops.${this.agency}.txt`) as stStop[];
    }

    private async readStopTimesFile(): Promise<void> {
        if (!this.times.length) this.times = await this.readFile(`./assets/stop_times.${this.agency}.txt`) as stTime[];
    }

    private async readFile(path: string): Promise<Object[]> {
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

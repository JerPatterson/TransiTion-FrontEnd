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
    private stops: Map<string, stStop>;
    private times: Map<string, stTime[]>;

    constructor() {
        this.calendar = [];
        this.trips = [];
        this.stops = new Map<string, stStop>();   // Key: Only stopId 
        this.times = new Map<string, stTime[]>(); // Key: Either tripId or stopId
        this.initLists();
    }

    async getTimesFromStopOfRoute(routeTag: string, stopTag: string): Promise<Time[]> {
        const now = Date.now();
        return (await this.getStaticTimesFromStopOfRoute(routeTag, stopTag))
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

    async getTimesFromRoute(routeTag: string): Promise<Time[]> {
        const now = Date.now();
        return (await this.getStaticTimesFromRoute(routeTag))
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

    async getAllStops(): Promise<stStop[]> {
        return (await this.readFile(`./assets/stops.${this.agency}.txt`) as stStop[])
    }

    private async getStaticTimesFromStopOfRoute(routeTag: string, stopTag: string): Promise<stTime[]> {
        return (await this.getStaticTimesFromRoute(routeTag)).filter((time) => time.stop_id.includes(stopTag));
    }

    private async getStaticTimesFromRoute(routeTag: string): Promise<stTime[]> {
        const today = new Date(Date.now()).getDay();
        const timeList: stTime[] = [];
        let tripTimes : stTime[] | undefined;
        (await this.getStaticTripsFromRoute(routeTag, today)).map(trip => trip.trip_id)
            .forEach((tripId) => {
            if ((tripTimes = this.times.get(tripId)))
                timeList.push(...tripTimes) 
            });
        return timeList;
    }

    private async getStaticTripsFromRoute(routeTag: string, day: number): Promise<stTrip[]> {
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
        if (this.stops.size) return;
        (await this.readFile(`./assets/stops.${this.agency}.txt`) as stStop[])
            .forEach((stop) => this.stops.set(stop.stop_id, stop));
    }

    private async readStopTimesFile(): Promise<void> {
        if (this.times.size) return;
        let tripTimes: stTime[] | undefined;
        (await this.readFile(`./assets/stop_times.${this.agency}.txt`) as stTime[])
            .forEach((time) => {
                if (tripTimes = this.times.get(time.trip_id)) {
                    tripTimes.push(time);
                    this.times.set(time.trip_id, tripTimes);
                    this.times.set(time.stop_id, tripTimes);
                } else {
                    this.times.set(time.trip_id, [time]);
                    this.times.set(time.stop_id, [time]);
                }
            });
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

import { Injectable } from '@angular/core';
import { ONE_SEC_IN_MS } from '@app/constants/time';
import { Day, DateException } from '@app/enums/attributes';
import { CalendarElement, CalendarExceptionElement, Route, ScheduledTime, ShapePt, Stop, Trip } from '@app/interfaces/concepts';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore, Firestore, doc, collection, getDoc } from 'firebase/firestore';

@Injectable({
    providedIn: 'root'
})
export class StaticDataService {
    private app: FirebaseApp;
    private db: Firestore;

    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyDg8LZ-iLsQsdOcpbt7-x4140paDko0cQg",
            authDomain: "transit-d9a47.firebaseapp.com",
            projectId: "transit-d9a47",
            storageBucket: "transit-d9a47.appspot.com",
            messagingSenderId: "819307086539",
            appId: "1:819307086539:web:6d88ec269b678cc4a0114e",
            measurementId: "G-6YK9RSL08K"
        };
    
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
    }

    async getRoutesFromAgency(agencyId: string): Promise<Route[]> {
        const storedContent = sessionStorage.getItem(`${agencyId}/routes`);
        if (storedContent) return JSON.parse(storedContent) as Route[];

        const content = (await this.getDocumentFromAgency(agencyId, 'routes')).data()?.arr as Route[];
        sessionStorage.setItem(`${agencyId}/routes`, JSON.stringify(content));
    
        return content;
    }

    async getStopsFromAgency(agencyId: string): Promise<Stop[]> {
        const storedContent = sessionStorage.getItem(`${agencyId}/stops`);
        if (storedContent) return JSON.parse(storedContent) as Stop[];

        const content = (await this.getDocumentFromAgency(agencyId, 'stops')).data()?.arr as Stop[];
        sessionStorage.setItem(`${agencyId}/stops`, JSON.stringify(content));
    
        return content;
    }

    async getStopsFromRoute(agencyId: string, routeId: string): Promise<Stop[]> {
        return (await this.getStopsFromAgency(agencyId)).filter(stop => stop.routeIds.includes(routeId));
    }

    async getStop(agencyId: string, stopId: string): Promise<Stop | undefined> {
        return (await this.getStopsFromAgency(agencyId)).find(stop => stop.id === stopId);
    }

    async getTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<ScheduledTime[]> {
        const times: ScheduledTime[] = [];
        const trips = await this.getTodayTripsFromRoute(agencyId, routeId);
    
        trips.forEach(trip => {
            const time = trip.times.find(time => time.stopId === stopId);
            if (time) times.push({ ...time, shapeId: trip.shapeId, tripId: trip.id, stopId, routeId });
        });
        return times;
    }

    async getTimesFromRoute(agencyId: string, routeId: string, stopId: string): Promise<ScheduledTime[]> {
        const times: ScheduledTime[] = [];
        const trips = await this.getTodayTripsFromRoute(agencyId, routeId);
    
        trips.forEach(trip => {
            trip.times.forEach(time => {
                times.push({ ...time, shapeId: trip.shapeId, tripId: trip.id, stopId, routeId });
            });
        });
        return times;
    }

    async getTimesFromStop(agencyId: string, stopId: string): Promise<ScheduledTime[]> {
        let times: ScheduledTime[] = [];
        const stop = await this.getStop(agencyId, stopId);

        for (let routeId of stop ? stop.routeIds : []) {
            times = times.concat(await this.getTimesFromStopOfRoute(agencyId, routeId, stopId));
        }
        return times;
    }

    async getShapeOfTrip(agencyId: string, shapeId: string): Promise<ShapePt[]> {
        return (await this.getDocumentFromAgency(agencyId, `/trips/shapes/${shapeId}`)).data()?.arr as ShapePt[];
    }

    async getTodayTripsFromRoute(agencyId: string, routeId: string): Promise<Trip[]> {
        return this.getTripsFromRoute(agencyId, routeId, await this.getTodayServiceId(agencyId));
    }

    private async getTodayServiceId(agencyId: string): Promise<string> {
        const now = new Date(Date.now());
        const calendarDates = await this.getCalendarDatesFromAgency(agencyId);
        const specialService = calendarDates.find(element => 
            this.isTheSameDate(now, new Date(element.date.seconds * ONE_SEC_IN_MS)) && element.exceptionType === DateException.Replacing
        );
        if (specialService) return specialService.serviceId;

        const calendar = await this.getCalendarFromAgency(agencyId);
        const service = calendar.find(element => {
            if (this.isBetweenTwoDates(now, new Date(element.startDate.seconds * ONE_SEC_IN_MS), new Date(element.endDate.seconds * ONE_SEC_IN_MS)))
                return this.isServiceOfDay(element, now.getUTCDay());
            return false;
        });

        return service ? service.serviceId : '';
    }

    private async getCalendarFromAgency(agencyId: string) {
        const storedContent = sessionStorage.getItem(`${agencyId}/calendar`);
        if (storedContent) return JSON.parse(storedContent) as CalendarElement[];

        const content = (await this.getDocumentFromAgency(agencyId, 'calendar')).data()?.arr as CalendarElement[];
        sessionStorage.setItem(`${agencyId}/calendar`, JSON.stringify(content));
    
        return content;
    }

    private async getCalendarDatesFromAgency(agencyId: string) {
        const storedContent = sessionStorage.getItem(`${agencyId}/calendar-dates`);
        if (storedContent) return JSON.parse(storedContent) as CalendarExceptionElement[];

        const content = (await this.getDocumentFromAgency(agencyId, 'calendar-dates')).data()?.arr as CalendarExceptionElement[];
        sessionStorage.setItem(`${agencyId}/calendar-dates`, JSON.stringify(content));

        return content;
    }

    private async getTripsFromRoute(agencyId: string, routeId: string, serviceId: string): Promise<Trip[]> {
        return (await this.getDocumentFromAgency(agencyId, `trips/${routeId}/${serviceId}`)).data()?.arr as Trip[];
    }

    private async getDocumentFromAgency(agencyId: string, documentId: string) {
        return getDoc(doc(collection(this.db, agencyId), documentId));
    }

    private isTheSameDate(a: Date, b: Date) {
        return a.getDay() === b.getDay() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    }

    private isBetweenTwoDates(value: Date, start: Date, end: Date) {
        return start.getTime() < value.getTime() && value.getTime() < end.getTime();
    }

    private isServiceOfDay(calendarElement: CalendarElement, dayOfTheWeek: number): boolean {
        switch (dayOfTheWeek) {
            case Day.Sunday:
                return calendarElement.sunday;
            case Day.Monday:
                return calendarElement.monday
            case Day.Tuesday:
                return calendarElement.tuesday
            case Day.Wednesday:
                return calendarElement.wednesday
            case Day.Thursday:
                return calendarElement.thursday;
            case Day.Friday:
                return calendarElement.friday;
            case Day.Saturday:
                return calendarElement.sathurday;
            default:
                return false;
        }
    }
}

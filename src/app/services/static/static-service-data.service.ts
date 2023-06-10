import { Injectable } from '@angular/core';
import { ONE_SEC_IN_MS, SECONDS_IN_DAY } from '@app/constants/time';
import { DateException, Day } from '@app/enums/attributes';
import { CalendarElement, CalendarExceptionElement } from '@app/interfaces/gtfs';
import { StaticDataService } from '@app/services/static/static-data.service';

@Injectable({
    providedIn: 'root'
})
export class StaticServiceDataService {
    
    constructor(private staticDataService: StaticDataService) {}

    async getTodayServiceId(agencyId: string): Promise<string> {
        const now = new Date(Date.now());
        const specialServiceId = await this.checkForExceptionServiceId(agencyId, now);
        if (specialServiceId) return specialServiceId;

        const serviceId = await this.checkForServiceId(agencyId, now);
        return serviceId ? serviceId : '';
    }

    async getTomorrowServiceId(agencyId: string): Promise<string> {
        const now = new Date(Date.now() + SECONDS_IN_DAY * ONE_SEC_IN_MS);
        const specialServiceId = await this.checkForExceptionServiceId(agencyId, now);
        if (specialServiceId) return specialServiceId;

        const serviceId = await this.checkForServiceId(agencyId, now);
        return serviceId ? serviceId : '';
    }

    private async checkForServiceId(agencyId: string, date: Date): Promise<string | undefined> {
        const calendar = await this.getCalendarFromAgency(agencyId);
        return calendar.find((e: CalendarElement) => {
            let startDate = new Date(e.startDate.seconds * ONE_SEC_IN_MS);
            let endDate = new Date(e.endDate.seconds * ONE_SEC_IN_MS);
            return this.isBetweenTwoDates(date, startDate, endDate) && this.isServiceOfDay(e, date.getDay());
        })?.serviceId;
    }

    private async checkForExceptionServiceId(agencyId: string, date: Date): Promise<string | undefined> {
        const calendarDates = await this.getCalendarDatesFromAgency(agencyId);
        return calendarDates.find((e: CalendarExceptionElement) => {
            let specialDate = new Date(e.date.seconds * ONE_SEC_IN_MS);
            return this.isTheSameDate(date, specialDate) 
                && e.exceptionType === DateException.Replacing;
        })?.serviceId;
    }

    private async getCalendarFromAgency(agencyId: string) {
        return await this.staticDataService.getArrayFromDocument(agencyId, 'calendar') as CalendarElement[];
    }

    private async getCalendarDatesFromAgency(agencyId: string): Promise<CalendarExceptionElement[]> {
        return await this.staticDataService.getArrayFromDocument(agencyId, 'calendar-dates') as CalendarExceptionElement[];
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

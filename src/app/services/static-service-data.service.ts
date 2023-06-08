import { Injectable } from '@angular/core';
import { ONE_SEC_IN_MS } from '@app/constants/time';
import { DateException, Day } from '@app/enums/attributes';
import { CalendarElement, CalendarExceptionElement } from '@app/interfaces/concepts';
import { StaticDataService } from '@app/services/static-data.service';

@Injectable({
    providedIn: 'root'
})
export class StaticServiceDataService {
    
    constructor(private staticDataService: StaticDataService) {}

    async getTodayServiceId(agencyId: string): Promise<string> {
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

        const content = (await this.staticDataService.getDocumentFromAgency(agencyId, 'calendar')).data()?.arr as CalendarElement[];
        sessionStorage.setItem(`${agencyId}/calendar`, JSON.stringify(content));
    
        return content;
    }

    private async getCalendarDatesFromAgency(agencyId: string) {
        const storedContent = sessionStorage.getItem(`${agencyId}/calendar-dates`);
        if (storedContent) return JSON.parse(storedContent) as CalendarExceptionElement[];

        const content = (await this.staticDataService.getDocumentFromAgency(agencyId, 'calendar-dates')).data()?.arr as CalendarExceptionElement[];
        sessionStorage.setItem(`${agencyId}/calendar-dates`, JSON.stringify(content));

        return content;
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

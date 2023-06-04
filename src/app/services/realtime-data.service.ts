import { Injectable } from '@angular/core';
import { Time } from '@app/interfaces/concepts';

@Injectable({
    providedIn: 'root'
})
export class RealtimeDataService {
    private rtDataAPI: string;
    
    constructor() {
        this.rtDataAPI = 'https://retro.umoiq.com/service/publicXMLFeed?';
    }
    
    async getTimesFromStop(agencyId: string, stopId: string): Promise<Time[]> {
        const timeList: Time[] = [];
        const url = this.addCommandToURL('predictions', `a=${agencyId}`, `stopID${stopId}`);

        const res = await fetch(url);
        const xmlString = await res.text();
        const xmlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
        const predictions = xmlDocument.querySelectorAll('predictions');
        
        predictions.forEach((route) => 
            route.querySelectorAll('prediction').forEach((time) => {
                timeList.push({
                    epochTime: Number(time.getAttribute('epochTime')),
                    secondsAhead: Number(time.getAttribute('seconds')),
                    minutesAhead: Number(time.getAttribute('minutes')),
                    routeId: String(time.getAttribute('routeTitle')),
                    tripId: String(time.getAttribute('tripTag')),
                });
            })
        );

        return timeList.sort((a, b) => a.epochTime - b.epochTime);
    }
    
    private addCommandToURL(commandName: string, ...params: string[]): string {
        return `${this.rtDataAPI}command=${commandName}${params.reduce((previous, current) => `${previous}&${current}`)}`;
    }
}

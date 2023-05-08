import { Injectable } from '@angular/core';
import { Time, StaticTime } from '../interfaces/real-time-communications';
import { ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC, ONE_SEC_IN_MS } from '../constants/time';

@Injectable({
    providedIn: 'root'
})
export class StaticDataService {
    private agency = 'stl'
    private timesList: StaticTime[];

    constructor() {
        this.timesList = [];
    }
    
    async getTimeExpectedList(routeTag: string, stopTag: string): Promise<Time[]> {
        if (!this.timesList.length) await this.readStopTimesFile();
        return this.timesList.filter((time) => time.trip_id.includes(routeTag) && time.stop_id.includes(stopTag))
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

    private async readStopTimesFile(): Promise<void> {
        const VALUE_DELIMITER = ',';
        const LINE_DELIMITER = '\r\n';
        
        const path = `./assets/stop_times.${this.agency}.txt`;
        const content = await fetch(path).then((res) => res.text());
        const parameters = content.split(LINE_DELIMITER, 1)[0].split(VALUE_DELIMITER);

        this.timesList = content.split(LINE_DELIMITER).slice(1).map((line) => {
            const result = Object();
            line.split(VALUE_DELIMITER).forEach((value, index) => {
                result[parameters[index]] = value;
            });
            return result;
        });
    }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ACCEPTABLE_DELAY_IN_SEC, ONE_HOUR_IN_MIN, ONE_MINUTE_IN_SEC } from '@app/utils/constants';
import { TripArrivalState } from '@app/enums/states';
import { Time } from '@app/interfaces/time-concepts';

@Component({
    selector: 'app-time-comparison',
    templateUrl: './time-comparison.component.html',
    styleUrls: ['./time-comparison.component.css']
})
export class TimeComparisonComponent {
    @Input() times: Time[] = [];
    @Input() selectedTripId: string = "";
    @Output() newTripEvent = new EventEmitter<Time>();

    onClick(time: Time) {
        this.newTripEvent.emit(time);
    }

    formatTimeToWait(minutes: number, seconds: number): string {
        let stringContent = '';
        if (minutes >= ONE_HOUR_IN_MIN)
            stringContent += `${Math.floor(minutes / ONE_HOUR_IN_MIN)}hr `;
        
        const waitMin = minutes % ONE_HOUR_IN_MIN;
        const waitSec = seconds - minutes * ONE_MINUTE_IN_SEC;
        stringContent += `${this.convertToTwoDigit(waitSec < 0 ? waitMin - 1 : waitMin)}min `;
        stringContent += `${this.convertToTwoDigit(waitSec < 0 ? ONE_MINUTE_IN_SEC + waitSec : waitSec)}s`

        return stringContent;
    }

    formatTimeDifference(time: Time): string {
        if (!time.rtMinutesAhead || !time.rtSecondsAhead) return ' ';
        const minutes = Math.abs(time.stMinutesAhead - time.rtMinutesAhead);
        const seconds = Math.abs(time.stSecondsAhead - time.rtSecondsAhead);
        return this.formatTimeToWait(minutes, seconds);
    }

    getTripArrivalState(time: Time): TripArrivalState {
        if (time.rtSecondsAhead === undefined) return TripArrivalState.Unknown;
        const difference = time.rtSecondsAhead - time.stSecondsAhead;
        if (difference < -ACCEPTABLE_DELAY_IN_SEC) 
            return TripArrivalState.Early;
        else if (difference > ACCEPTABLE_DELAY_IN_SEC)
            return TripArrivalState.Late;
        else
            return TripArrivalState.OnTime;
    }

    private convertToTwoDigit(number: number) {
        return number > 9 ? number : '0' + number;
    }
}

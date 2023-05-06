import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Stop } from '../../interfaces/real-time-communications';
import { RealTimeDataService } from '../../services/real-time-data.service';

@Component({
    selector: 'app-stop-list',
    templateUrl: './stop-list.component.html',
    styleUrls: ['./stop-list.component.css']
})
export class StopListComponent implements OnChanges {
    @Input() routeTag: string;
    @Output() newStopTag: EventEmitter<string>;

    stops: Stop[];
    
    constructor(private rtDataService: RealTimeDataService) {
        this.routeTag = '';
        this.newStopTag = new EventEmitter<string>();
        this.stops = [];
    }

    ngOnChanges() {
        this.getStopList();
    }

    getStopList(): void {
        this.stops = this.rtDataService.getStopList(this.routeTag);
    }

    stopChange(event: Event): void {
        const tag = (event.target as any).value;
        if (tag) this.newStopTag.emit(tag);
    }
}

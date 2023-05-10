import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { rtStop } from '../../interfaces/real-time-communications';
import { RealTimeDataService } from '../../services/real-time-data.service';
import { StaticDataService } from 'src/app/services/static-data.service';

@Component({
    selector: 'app-stop-list',
    templateUrl: './stop-list.component.html',
    styleUrls: ['./stop-list.component.css']
})
export class StopListComponent implements OnChanges {
    @Input() routeTag: string;
    @Output() newStopTag: EventEmitter<string>;

    stops: rtStop[];
    
    constructor(
        private readonly rtDataService: RealTimeDataService, 
        private readonly stDataService: StaticDataService,
    ) {
        this.routeTag = '';
        this.newStopTag = new EventEmitter<string>();
        this.stops = [];
    }

    async ngOnChanges() {
        await this.getStopList();
        this.newStopTag.emit(this.stops.length > 0 ? this.stops[0].tag : '');
    }

    async getStopList(): Promise<void> {
        // TODO if (this.routeTag === 'all') this.stDataService.getAllStops();
        this.stops = await this.rtDataService.getStopList(this.routeTag);
    }

    stopChange(event: Event): void {
        const stopTag = (event.target as any).value;
        if (stopTag) this.newStopTag.emit(stopTag);
    }
}

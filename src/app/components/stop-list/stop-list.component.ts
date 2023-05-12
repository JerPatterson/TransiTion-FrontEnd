import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { rtStop } from '../../interfaces/real-time-communications';
import { RealTimeDataService } from '../../services/real-time-data.service';
import { StaticDataService } from 'src/app/services/static-data.service';
import { Filter } from 'src/app/enums/filter';

@Component({
    selector: 'app-stop-list',
    templateUrl: './stop-list.component.html',
    styleUrls: ['./stop-list.component.css']
})
export class StopListComponent implements OnChanges {
    @Input() filter: Filter;
    @Input() routeTag: string;
    @Output() newStopTag: EventEmitter<string>;

    stops: rtStop[];
    
    constructor(
        private readonly rtDataService: RealTimeDataService, 
        private readonly stDataService: StaticDataService,
    ) {
        this.filter = Filter.Default;
        this.routeTag = '';
        this.newStopTag = new EventEmitter<string>();
        this.stops = [];
    }

    async ngOnChanges() {
        await this.getStopList();
        this.newStopTag.emit(this.stops.length > 0 ? this.stops[0].tag : '');
    }

    async getStopList(): Promise<void> {
        if (this.filter === Filter.Default)
            this.stops = await this.rtDataService.getStopsOfRoute(this.routeTag);
        else if (this.filter === Filter.Stops)
            this.stops = await this.getAllStops();
    }

    stopChange(event: Event): void {
        const stopTag = (event.target as any).value;
        if (stopTag) this.newStopTag.emit(stopTag);
    }

    private async getAllStops(): Promise<rtStop[]> {
        return (await this.stDataService.getAllStops()).map((stop) => { 
            return {
                tag: stop.stop_code,
                title: stop.stop_name,
                longitude: Number(stop.stop_lat),
                latitude: Number(stop.stop_lon),
            }
        });
    }
}

import { Injectable } from '@angular/core';
import { SERVER_URL } from '@app/utils/env';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

@Injectable({
    providedIn: 'root'
})
export class RealtimeDataService {
    async getVehiclesFromAgency(agencyId: string):
        Promise<GtfsRealtimeBindings.transit_realtime.IVehiclePosition[]> {
        const response = await fetch(`${SERVER_URL}/vehicles/${agencyId.toLowerCase()}`);
        return response.json();
    }
    async getVehiclesFromRoute(agencyId: string, routeId: string): 
        Promise<GtfsRealtimeBindings.transit_realtime.IVehiclePosition[]> {
        const response = await fetch(`${SERVER_URL}/vehicles/route/${agencyId.toLowerCase()}/${routeId}`);
        return response.json();
    }

    // async getTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<PredictedTime[]> {
    //     const timeList: PredictedTime[] = [];
    //     const url = this.addCommandToURL('predictions', `a=${agencyId.toLowerCase()}`, `stopId=${stopId}`, `routeTag=${routeId}`);

    //     const res = await fetch(url);
    //     const xmlString = await res.text();
    //     const xmlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
    //     const predictions = xmlDocument.querySelectorAll('predictions');
        
    //     predictions.forEach((route) => 
    //         route.querySelectorAll('prediction').forEach((time) => {
    //             timeList.push({
    //                 epochTime: Number(time.getAttribute('epochTime')),
    //                 secondsAhead: Number(time.getAttribute('seconds')),
    //                 minutesAhead: Number(time.getAttribute('minutes')),
    //                 routeId: String(time.getAttribute('routeTitle')),
    //                 tripId: String(time.getAttribute('tripTag')),
    //             });
    //         })
    //     );

    //     return timeList.sort((a, b) => a.epochTime - b.epochTime);
    // }
    
    // async getTimesFromStop(agencyId: string, stopId: string): Promise<PredictedTime[]> {
    //     const timeList: PredictedTime[] = [];
    //     const url = this.addCommandToURL('predictions', `a=${agencyId.toLowerCase()}`, `stopId=${stopId}`);

    //     const res = await fetch(url);
    //     const xmlString = await res.text();
    //     const xmlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
    //     const predictions = xmlDocument.querySelectorAll('predictions');
        
    //     predictions.forEach((route) => 
    //         route.querySelectorAll('prediction').forEach((time) => {
    //             timeList.push({
    //                 epochTime: Number(time.getAttribute('epochTime')),
    //                 secondsAhead: Number(time.getAttribute('seconds')),
    //                 minutesAhead: Number(time.getAttribute('minutes')),
    //                 routeId: String(time.getAttribute('routeTitle')),
    //                 tripId: String(time.getAttribute('tripTag')),
    //             });
    //         })
    //     );

    //     return timeList.sort((a, b) => a.epochTime - b.epochTime);
    // }

    // async getVehiclesFromRoute(agencyId: string, routeId: string): Promise<Vehicle[]> {
    //     const vehicleList: Vehicle[] = [];
    //     const url = this.addCommandToURL('vehicleLocations', `a=${agencyId.toLowerCase()}`, `r=${routeId}`);

    //     const res = await fetch(url);
    //     const xmlString = await res.text();
    //     const xmlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
    //     const vehicles = xmlDocument.querySelectorAll('vehicle');

    //     vehicles.forEach((vehicle) => 
    //         vehicleList.push({
    //             id: Number(vehicle.getAttribute('id')),
    //             speed: Number(vehicle.getAttribute('speedKmHr')),
    //             dirTag: String(vehicle.getAttribute('dirTag')),
    //             location: {
    //                 lat: Number(vehicle.getAttribute('lat')),
    //                 lon: Number(vehicle.getAttribute('lon')),
    //             },
    //             secsSinceReport: Number(vehicle.getAttribute('secsSinceReport')),
    //             heading: Number(vehicle.getAttribute('heading')),
    //         })
    //     );

    //     return vehicleList;
    // }

    // async getVehiclesFromAgency(agencyId: string): Promise<Vehicle[]> {
    //     const vehicleList: Vehicle[] = [];
    //     const url = this.addCommandToURL('vehicleLocations', `a=${agencyId.toLowerCase()}`);

    //     const res = await fetch(url);
    //     const xmlString = await res.text();
    //     const xmlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
    //     const vehicles = xmlDocument.querySelectorAll('vehicle');

    //     vehicles.forEach((vehicle) => 
    //         vehicleList.push({
    //             id: Number(vehicle.getAttribute('id')),
    //             speed: Number(vehicle.getAttribute('speedKmHr')),
    //             dirTag: String(vehicle.getAttribute('dirTag')),
    //             location: {
    //                 lat: Number(vehicle.getAttribute('lat')),
    //                 lon: Number(vehicle.getAttribute('lon')),
    //             },
    //             secsSinceReport: Number(vehicle.getAttribute('secsSinceReport')),
    //             heading: Number(vehicle.getAttribute('heading')),
    //         })
    //     );

    //     return vehicleList;
    // }
    
    // private addCommandToURL(commandName: string, ...params: string[]): string {
    //     return `${this.rtDataAPI}command=${commandName}&${params.reduce((previous, current) => `${previous}&${current}`)}`;
    // }
}

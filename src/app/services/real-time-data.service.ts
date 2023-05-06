import { Injectable } from '@angular/core';
import { realTimeDataAPI } from '../environments/environment';
import { Agency, Route, Stop } from '../interfaces/real-time-communications';

@Injectable({
    providedIn: 'root'
})
export class RealTimeDataService {
    private agency = 'stl'

    getAgencyList(): Agency[] {
        const agencyList: Agency[] = [];

        fetch(this.addCommandToURL(realTimeDataAPI, 'agencyList')).then((res) => {
            return res.text();
        }).then((xmlString) => {
            const xmlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
            const agencies = xmlDocument.querySelectorAll('agency');

            agencies.forEach((agency) => {
                const tag =  agency.getAttribute('tag');
                const title = agency.getAttribute('title');
                const regionTitle = agency.getAttribute('regionTitle');
                if (tag && title) {
                    agencyList.push({ tag, title, regionTitle })
                }
            });
        });

        return agencyList;
    }

    getRouteList(): Route[] {
        const routeList: Route[] = [];

        fetch(this.addParameterToURL(this.addCommandToURL(realTimeDataAPI, 'routeList'), 'a', this.agency)).then((res) => {
            return res.text();
        }).then((xmlString) => {
            const xmlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
            const routes = xmlDocument.querySelectorAll('route');

            routes.forEach((route) => {
                const tag =  route.getAttribute('tag');
                const title = route.getAttribute('title');
                if (tag && title) {
                    routeList.push({ tag, title })
                }
            });
        });

        return routeList;
    }

    getStopList(routeTag: string): Stop[] {
        const stopList: Stop[] = [];

        fetch(this.addParametersToURL(this.addCommandToURL(realTimeDataAPI, 'routeConfig'), ['a', 'r'], [this.agency, routeTag])).then((res) => {
            return res.text();
        }).then((xmlString) => {
            const xmlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
            const stops = xmlDocument.querySelectorAll('stop');

            stops.forEach((stop) => {
                const tag =  stop.getAttribute('tag');
                const title = stop.getAttribute('title');
                const location = {
                    latitude: Number(stop.getAttribute('lat')),
                    longitude: Number(stop.getAttribute('lon')),
                }
                if (tag && title) {
                    stopList.push({ tag, title, location })
                }
            });
        });

        return stopList;
    }

    private addCommandToURL(url: string, commandName: string): string {
        return url + 'command=' + commandName;
    }

    private addParameterToURL(url: string, paramName: string, param: string): string {
        return url + '&' + paramName + '=' + param;
    }

    private addParametersToURL(url: string, paramNames: string[], param: string[]): string {
        if (paramNames.length === param.length)
            paramNames.forEach((paramName, index) => url += '&' + paramName + '=' + param[index]);

        return url;
    }
}

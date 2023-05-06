import { Injectable } from '@angular/core';
import { realTimeDataAPI } from '../environments/environment';
import { Agency, Route } from '../interfaces/real-time-communications';

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

    private addCommandToURL(url: string, commandName: string): string {
        return url + 'command=' + commandName;
    }

    private addParameterToURL(url: string, paramName: string, param: string) {
        return url + '&' + paramName + '=' + param;
    }
}

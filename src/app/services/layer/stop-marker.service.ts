import { Injectable } from '@angular/core';
import L from 'leaflet';
import { StopDto } from '@app/utils/dtos';
import { StaticDataService } from '@app/services/static/static-data.service';
import { StopId } from '@app/utils/component-interface';
import { AGENCY_TO_STYLE } from '@app/utils/styles';
import { DEFAULT_BACKGROUND_COLOR, STOP_ANCHOR_SHIFT, STOP_ICON_SIZE } from '@app/utils/constants';

@Injectable({
    providedIn: 'root'
})
export class StopMarkerService {
    private stopsLayer?: L.LayerGroup;
    private tripStopsLayer?: L.LayerGroup;
    
    constructor(private staticDataService: StaticDataService) {}

    async createStopsLayer(stopIds: StopId[]): Promise<L.LayerGroup> {
        this.clearStopsLayer();
        this.stopsLayer = await this.buildStopsLayer(stopIds);

        return this.stopsLayer;
    }

    async clearStopsLayer(): Promise<void> {
        this.stopsLayer?.remove();
        this.stopsLayer = undefined;
    }

    async createTripStopsLayer(agencyId: string, tripId: string, color: string): Promise<L.LayerGroup> {
        this.clearTripStopsLayer();
        this.tripStopsLayer = await this.buildTripStopsLayer(
            agencyId, tripId, color
        );

        return this.tripStopsLayer;
    }

    async clearTripStopsLayer(): Promise<void> {
        this.tripStopsLayer?.remove();
        this.tripStopsLayer = undefined;
    }


    private async buildStopsLayer(stopIds: StopId[]): Promise<L.LayerGroup> {
        let stopMarkers: L.Marker[] = [];
        let uniqueAgencyStopIds: string[] = [];
        stopIds = stopIds.sort((a, b) => a.agencyId.localeCompare(b.agencyId));
        for (const [i, stopId] of stopIds.entries()) {
            uniqueAgencyStopIds.push(stopId.stopId);
            if ((i + 1) === stopIds.length || stopId.agencyId !== stopIds[i + 1].agencyId) {
                stopMarkers = stopMarkers.concat(await Promise.all(
                    (await this.staticDataService.getStopByIds(stopId.agencyId, uniqueAgencyStopIds))
                        .map(async (stop) => await this.buildStopMarker(stopId.agencyId, stop))
                ));
                uniqueAgencyStopIds = [];
            }
        }

        return L.layerGroup(stopMarkers);
    }

    private async buildStopMarker(agencyId: string, stop: StopDto) : Promise<L.Marker> {
        const marker = L.marker(
                [stop.stop_lat, stop.stop_lon], 
                { icon: await this.buildStopIconCanvas(agencyId, stop) },
            ).addEventListener(
                'click', 
                async () => {
                    console.log(stop.stop_id);
                },
            );
    
        return marker;
    }

    private async buildTripStopsLayer(agencyId: string, tripId: string, color: string): Promise<L.LayerGroup> {
        const stopMarkers = await Promise.all(
            (await this.staticDataService.getStopsFromTrip(agencyId, tripId))
                .map(async (stop) => await this.buildTripStopMarker(stop, color))
        );

        return L.layerGroup(stopMarkers);
    }

    private async buildTripStopMarker(stop: StopDto, color: string): Promise<L.CircleMarker> {
        const marker = L.circleMarker([stop.stop_lat, stop.stop_lon], {
            radius: 5,
            fillOpacity: 1,
            color: color,
            fillColor: "#ffffff",
            pane: 'stopmarker',
            interactive: true,
        });

        return marker.bindPopup(`${stop.stop_name} [${stop.stop_code}]`);
    }


    private async buildStopIconCanvas(agencyId: string, stop: StopDto): Promise<L.DivIcon> {
        const iconColor = this.getIconColor(agencyId);
        const backgroundColor = this.getBackgroundColor(agencyId);
        const iconSVG = await this.getIconSVGFromStop(iconColor, stop.stop_shelter);

        return L.icon({
            iconUrl: this.getIconUrl(iconSVG, backgroundColor),
            iconSize: [STOP_ICON_SIZE, STOP_ICON_SIZE],
            iconAnchor: [STOP_ANCHOR_SHIFT, STOP_ANCHOR_SHIFT],
        });
    }

    private getIconColor(agencyId: string): string {
        const color = AGENCY_TO_STYLE.get(agencyId.toLowerCase())?.iconColor;
        return color ? color : DEFAULT_BACKGROUND_COLOR;
    }

    private getBackgroundColor(agencyId: string): string {
        const color = AGENCY_TO_STYLE.get(agencyId.toLowerCase())?.backgroundColor;
        return color ? color : DEFAULT_BACKGROUND_COLOR;
    }

    private getIconUrl(
        iconSVG: string,
        backgroundColor: string,
    ): string  {
        return `
            data:image/svg+xml,
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 80 80">
                <g fill="${backgroundColor.replace('#', '%23')}">
                    <defs>
                        <filter id="blur">
                            <feDropShadow dx="0" dy="0" stdDeviation="3.0"
                                flood-color="black"/>
                        </filter>
                        <mask id="circle-mask" x="-0.2" y="-0.2" width="1.4" height="1.4">
                            <circle cx="40" cy="40" r="25" fill="white"/>  
                            <circle cx="40" cy="40" r="20" fill="black"/>  
                        </mask>
                        <mask id="arrow-mask" x="-0.2" y="-0.2" width="1.4" height="1.4">
                            <path d="M40,80 15,52 40,60 65,52z" fill="white"/>
                            <path d="M40,75 25,58 40,65 55,58z" fill="black"/> 
                        </mask>
                    </defs>
                    <circle cx="40" cy="40" r="20" style="mask: url(%23circle-mask); filter: url(%23blur)"/>
                    <circle cx="40" cy="40" r="20"/>
                </g>
                ${iconSVG}
            </svg>
        `;
    }

    private async getIconSVGFromStop(
        iconColor: string,
        type?: number,
    ): Promise<string> {
        switch(type) {
            case 1:
                return `
                    <svg
                        version="1.0"
                        height="32" x="0" y="22"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 560.000000 446.000000"
                        preserveAspectRatio="xMidYMid meet">
                        <g
                            stroke="none"
                            fill="${iconColor.replace('#', '%23')}"
                            transform="translate(0.000000,446.000000) scale(0.100000,-0.100000)">
                            <path d="M361 4289 c-173 -29 -320 -177 -353 -357 -12 -63 -8 -95 16 -127 13
                                -19 29 -20 213 -25 l198 -5 3 -87 3 -87 -28 -6 c-75 -16 -122 -59 -142 -131
                                -8 -27 -11 -510 -11 -1611 l0 -1573 -56 0 c-48 0 -59 -4 -85 -29 -37 -38 -39
                                -82 -4 -116 l24 -25 383 0 c285 1 387 4 399 13 46 35 47 101 2 137 -19 15 -41
                                20 -85 20 l-59 0 3 88 3 87 872 3 871 2 4 -149 c3 -142 4 -151 27 -175 30 -32
                                78 -34 114 -5 26 20 27 22 29 172 l3 152 788 3 787 2 0 -140 c0 -181 13 -210
                                91 -210 18 0 39 10 54 25 24 23 25 28 25 175 l0 150 178 -2 177 -3 0 -85 0
                                -85 -63 -5 c-54 -4 -67 -9 -88 -33 -13 -16 -24 -37 -24 -48 0 -28 26 -75 45
                                -83 22 -8 758 -8 780 0 19 8 45 55 45 83 0 11 -11 32 -24 48 -21 24 -34 29
                                -88 33 l-63 5 -5 1600 c-4 1191 -8 1605 -17 1620 -22 38 -68 73 -111 85 l-43
                                11 3 87 3 87 198 5 c238 6 230 2 225 121 -8 189 -165 357 -364 389 -76 13
                                -4778 11 -4853 -1z m4891 -181 c52 -25 106 -74 129 -120 l19 -38 -2605 0
                                c-1433 0 -2605 2 -2605 5 0 18 34 66 68 97 52 47 74 58 131 68 25 4 1122 7
                                2436 6 2253 -1 2392 -2 2427 -18z m-274 -420 c3 -94 7 -87 -59 -102 -14 -3
                                -41 -21 -60 -41 l-34 -35 -2029 0 -2029 0 -38 34 c-21 19 -56 40 -78 46 l-41
                                11 0 89 0 90 2183 -2 2182 -3 3 -87z m-4368 -1833 l0 -1576 -87 3 -88 3 -3
                                1560 c-1 858 0 1566 3 1573 3 8 31 12 90 12 l85 0 0 -1575z m4540 0 l0 -1575
                                -85 0 -85 0 0 1575 0 1575 85 0 85 0 0 -1575z m-2440 695 l0 -790 -962 2 -963
                                3 -3 775 c-1 426 0 781 3 788 3 9 206 12 965 12 l960 0 0 -790z m2095 0 l0
                                -785 -962 -3 -963 -2 0 790 0 790 963 -2 962 -3 0 -785z m0 -1440 l0 -475
                                -177 -3 -178 -2 0 90 0 90 63 0 c53 0 67 4 84 22 29 32 34 53 21 88 -22 63 38
                                60 -1133 60 l-1067 0 -29 -29 c-37 -38 -39 -82 -4 -116 20 -21 34 -25 85 -25
                                l60 0 0 -90 0 -90 -875 0 -875 0 0 480 0 480 2013 -2 2012 -3 0 -475z m-525
                                -390 l0 -90 -787 2 -788 3 -3 74 c-2 41 -1 80 2 88 4 11 142 13 791 13 l785 0
                                0 -90z"
                            />
                            <path d="M993 3136 l-28 -24 0 -561 0 -560 23 -23 23 -23 735 0 736 0 24 28
                                24 28 0 545 c0 559 -1 572 -39 601 -12 9 -187 12 -743 13 l-727 0 -28 -24z
                                m1367 -586 l0 -440 -615 0 -615 0 0 440 0 440 615 0 615 0 0 -440z"
                            />
                            <path d="M1339 2781 c-17 -18 -29 -40 -29 -56 0 -16 12 -38 29 -56 29 -29 31
                                -29 145 -29 106 0 117 2 142 24 21 18 28 32 28 61 0 29 -7 43 -28 61 -25 22
                                -36 24 -142 24 -114 0 -116 0 -145 -29z"
                            />
                            <path d="M1336 2429 c-34 -40 -33 -74 3 -110 l29 -29 200 0 200 0 31 26 c40
                                33 43 83 6 119 -24 25 -24 25 -234 25 l-209 0 -26 -31z"
                            />
                            <path d="M2049 2447 c-46 -35 -50 -88 -10 -128 27 -27 35 -29 101 -29 66 0 74
                                2 101 29 31 31 36 59 17 94 -20 38 -40 46 -118 46 -44 0 -82 -5 -91 -12z"
                            />
                        </g>
                    </svg>
                `;
            default:
                return `
                <svg
                    version="1.0"
                    height="32" x="0" y="22"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 200.000000 200.000000"
                    preserveAspectRatio="xMidYMid meet">
                    <g
                        stroke="none"
                        fill="${iconColor.replace('#', '%23')}"
                        transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)">
                        <path d="M895 1817 c-108 -36 -195 -108 -239 -200 -108 -219 2 -471 237 -543
                            l57 -18 0 -407 0 -408 -37 -3 c-38 -3 -38 -3 -41 -51 l-3 -47 131 0 131 0 -3
                            48 c-3 47 -3 47 -40 50 l-38 3 0 408 0 407 58 18 c282 86 371 435 164 643 -69
                            69 -156 106 -257 110 -48 2 -96 -2 -120 -10z m241 -100 c146 -74 210 -252 142
                            -397 -138 -298 -583 -203 -582 125 0 137 86 251 224 296 49 16 162 4 216 -24z"
                        />
                        <path d="M860 1633 c-25 -9 -40 -35 -40 -70 0 -18 -4 -33 -10 -33 -5 0 -10
                            -18 -10 -40 0 -22 5 -40 10 -40 6 0 10 -37 10 -90 l0 -90 39 0 c30 0 40 4 44
                            20 5 18 14 20 97 20 83 0 92 -2 97 -20 4 -16 14 -20 44 -20 l39 0 0 90 c0 53
                            4 90 10 90 6 0 10 18 10 40 0 22 -4 40 -10 40 -5 0 -10 15 -10 33 0 66 -12 72
                            -167 74 -76 1 -145 0 -153 -4z m288 -40 c3 -10 -31 -13 -147 -13 -139 0 -164
                            4 -144 24 4 3 70 5 147 4 100 -2 141 -6 144 -15z m-160 -100 l3 -63 -71 0 -70
                            0 0 65 0 66 68 -3 67 -3 3 -62z m162 2 l0 -65 -70 0 -70 0 0 58 c0 32 3 62 7
                            65 3 4 35 7 70 7 l63 0 0 -65z m0 -125 l0 -40 -150 0 -150 0 0 40 0 40 150 0
                            150 0 0 -40z"
                        />
                        <path d="M862 1368 c3 -7 21 -14 41 -16 28 -2 37 1 37 12 0 12 -11 16 -41 16
                            -28 0 -39 -4 -37 -12z"
                        />
                        <path d="M1060 1365 c0 -10 11 -15 35 -15 24 0 35 5 35 15 0 10 -11 15 -35 15
                            -24 0 -35 -5 -35 -15z"
                        />
                    </g>
                </svg>
                `;
        }
    }
}

import { Injectable } from '@angular/core';
import { AgencyDto, RouteDto, ShapeDto, StopDto, TimeDto, TripDto } from '@app/utils/dtos';
import { SERVER_URL } from '@app/utils/env';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore, Firestore, doc, collection, getDoc, DocumentSnapshot, DocumentData } from 'firebase/firestore';

@Injectable({
    providedIn: 'root'
})
export class StaticDataService {
    private app: FirebaseApp;
    private db: Firestore;

    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyDg8LZ-iLsQsdOcpbt7-x4140paDko0cQg",
            authDomain: "transit-d9a47.firebaseapp.com",
            projectId: "transit-d9a47",
            storageBucket: "transit-d9a47.appspot.com",
            messagingSenderId: "819307086539",
            appId: "1:819307086539:web:6d88ec269b678cc4a0114e",
            measurementId: "G-6YK9RSL08K"
        };
    
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
    }

    async getAgencies(): Promise<AgencyDto[]> {
        const res = await fetch(`${SERVER_URL}/agencies`);
        return res.json();
    }

    async getRoutesFromAgency(agencyId: string): Promise<RouteDto[]> {
        const res = await fetch(`${SERVER_URL}/routes/${agencyId}`);
        return res.json();
    }

    async getStopsFromAgency(agencyId: string): Promise<StopDto[]> {
        const res = await fetch(`${SERVER_URL}/stops/${agencyId}`);
        return res.json();
    }

    async getStop(agencyId: string, stopId: string): Promise<StopDto> {
        const res = await fetch(`${SERVER_URL}/stops/${agencyId}/${stopId}`);
        return res.json();
    }

    async getStopsFromRoute(agencyId: string, routeId: string): Promise<StopDto[]> {
        const res = await fetch(`${SERVER_URL}/stops/route/${agencyId}/${routeId}`);
        return res.json();
    }

    async getStopsFromTrip(agencyId: string, tripId: string): Promise<StopDto[]> {
        const res = await fetch(`${SERVER_URL}/stops/trip/${agencyId}/${tripId}`);
        return res.json();
    }

    async getShape(agencyId: string, shapeId: string): Promise<ShapeDto[]> {
        const res = await fetch(`${SERVER_URL}/shapes/${agencyId}/${shapeId}`);
        return res.json();
    }

    async getTrip(agencyId: string, tripId: string): Promise<TripDto> {
        const res = await fetch(`${SERVER_URL}/trips/${agencyId}/${tripId}`);
        return res.json();
    }

    async getTodayTripsFromStop(agencyId: string, stopId: string): Promise<TripDto[]> {
        const res = await fetch(`${SERVER_URL}/trips/stop/today/${agencyId}/${stopId}`);
        return res.json();
    }

    async getTodayTripsFromRoute(agencyId: string, routeId: string): Promise<TripDto[]> {
        const res = await fetch(`${SERVER_URL}/trips/route/today/${agencyId}/${routeId}`);
        return res.json();
    }

    async getTimesFromStop(agencyId: string, stopId: string): Promise<TimeDto[]> {
        const res = await fetch(`${SERVER_URL}/times/stop/today/${agencyId}/${stopId}`);
        return await res.json();
    }

    async getTimesFromStopOfRoute(agencyId: string, routeId: string, stopId: string): Promise<TimeDto[]> {
        const res = await fetch(`${SERVER_URL}/times/route/stop/today/${agencyId}/${routeId}/${stopId}`);
        return await res.json();
    }

    async getArrayFromDocument(agencyId: string, documentId: string): Promise<any[]> {
        const storedContent = sessionStorage.getItem(`${agencyId}/${documentId}`);
        if (storedContent) return JSON.parse(storedContent) as any[];

        const content = (await this.getDocumentFromAgency(agencyId, documentId)).data()?.arr as any[];
        sessionStorage.setItem(`${agencyId}/${documentId}`, JSON.stringify(content));

        return content;
    }

    async getDocumentFromAgency(agencyId: string, documentId: string): Promise<DocumentSnapshot<DocumentData>> {
        return getDoc(doc(collection(this.db, agencyId), documentId));
    }
}

import { Injectable } from '@angular/core';
import { RouteDto } from '@app/utils/dtos';
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

    async getRoutesFromAgency(agencyId: string): Promise<RouteDto[]> {
        const res = await fetch(`${SERVER_URL}/routes/${agencyId}`);
        return res.json();
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

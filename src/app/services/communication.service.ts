import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore, Firestore, doc, collection, getDoc, getDocs } from 'firebase/firestore';

@Injectable({
    providedIn: 'root'
})
export class CommunicationService {
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

    async getRoutesFromAgency(agencyId: string) {
        return this.getDocumentFromAgency(agencyId, 'all', 'routes');
    }

    async getStopsFromAgency(agencyId: string) {
        return this.getDocumentFromAgency(agencyId, 'all', 'stops');
    }

    async getCollectionFromAgency(agencyId: string, collectionId: string) {
        return getDocs(collection(this.db, 'agencies', agencyId, collectionId));
    }

    private async getDocumentFromAgency(agencyId: string, collectionId: string, documentId: string) {
        return getDoc(doc(collection(this.db, 'agencies', agencyId, collectionId), documentId));
    }
}

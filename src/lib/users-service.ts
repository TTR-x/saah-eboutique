
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { UserProfile } from './types';

const usersCollectionRef = collection(db, 'users');

export async function getUsers(): Promise<UserProfile[]> {
    const q = query(usersCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
        } as UserProfile;
    });
}

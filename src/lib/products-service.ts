
'use server'

import { collection, getDocs, getDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { Product } from './types';
import { db } from './firebase';

const productsCollectionRef = collection(db, 'products');

export async function getProducts(): Promise<Product[]> {
    const q = query(productsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
        } as Product
    });
}

export async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate()
        } as Product;
    } else {
        return null;
    }
}

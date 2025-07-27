
'use server'

import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { ImportOrder, ImportOrderInput } from './types';
import { revalidatePath } from 'next/cache';

const importOrdersCollectionRef = collection(db, 'import-orders');

export async function addImportOrder(orderInput: ImportOrderInput) {
    const newOrder = {
        ...orderInput,
        isRead: false,
        createdAt: serverTimestamp()
    };
    
    await addDoc(importOrdersCollectionRef, newOrder);
    revalidatePath('/admin/orders');
}

export async function getImportOrders(): Promise<ImportOrder[]> {
    const q = query(importOrdersCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
        } as ImportOrder;
    });
}

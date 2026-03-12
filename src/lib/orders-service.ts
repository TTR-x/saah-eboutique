
import { db } from './firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Order } from './types';

const ordersCollectionRef = collection(db, 'orders');

export async function getAllOrders(): Promise<Order[]> {
    try {
        const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
            } as Order;
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
}

export async function deleteOrder(orderId: string) {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
}

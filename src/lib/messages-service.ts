
'use server'

import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where,getCountFromServer, doc, updateDoc } from 'firebase/firestore';
import type { ContactMessage, ContactMessageInput } from './types';
import { revalidatePath } from 'next/cache';

const messagesCollectionRef = collection(db, 'contact-messages');

export async function addMessage(messageInput: ContactMessageInput) {
    const newMessage = {
        ...messageInput,
        isRead: false,
        createdAt: serverTimestamp()
    };
    
    await addDoc(messagesCollectionRef, newMessage);
    revalidatePath('/admin/messages');
    revalidatePath('/admin');
}

export async function getMessages(): Promise<ContactMessage[]> {
    const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
        } as ContactMessage;
    });
}

export async function getUnreadMessagesCount(): Promise<number> {
    try {
        const q = query(messagesCollectionRef, where('isRead', '==', false));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (e) {
        // This can happen if the collection does not exist yet.
        return 0;
    }
}

export async function markMessageAsRead(messageId: string) {
    const messageRef = doc(db, 'contact-messages', messageId);
    await updateDoc(messageRef, { isRead: true });
    revalidatePath('/admin/messages');
    revalidatePath('/admin');
}

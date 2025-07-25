
'use server'

import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
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

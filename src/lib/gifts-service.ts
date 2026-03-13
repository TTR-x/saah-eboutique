
'use client';

import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  doc, 
  setDoc,
  getCountFromServer,
  updateDoc
} from 'firebase/firestore';

export async function requestGift(userId: string, userName: string, userEmail: string) {
  const requestsRef = collection(db, 'gift-requests');
  // Vérifier si une demande existe déjà pour éviter les doublons
  const q = query(requestsRef, where('userId', '==', userId), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    await addDoc(requestsRef, {
      userId,
      userName,
      userEmail,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }
}

export async function getGiftRequests() {
  const requestsRef = collection(db, 'gift-requests');
  const q = query(requestsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function sendGift(userId: string, title: string, description: string, requestId?: string) {
  const giftsRef = collection(db, 'users', userId, 'gifts');
  
  // Compter les cadeaux existants
  const countSnapshot = await getCountFromServer(giftsRef);
  if (countSnapshot.data().count >= 3) {
    throw new Error("Ce client a déjà reçu le maximum de 3 cadeaux.");
  }

  await addDoc(giftsRef, {
    title,
    description,
    createdAt: serverTimestamp()
  });

  // Marquer la demande comme traitée si un requestId est fourni
  if (requestId) {
    const requestDoc = doc(db, 'gift-requests', requestId);
    await updateDoc(requestDoc, { status: 'processed' });
  }
}

export async function getUserGifts(userId: string) {
  const giftsRef = collection(db, 'users', userId, 'gifts');
  const q = query(giftsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

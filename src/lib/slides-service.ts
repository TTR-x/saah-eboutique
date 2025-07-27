
'use server'

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Slide } from './types';
import { db } from './firebase';

const slidesCollectionRef = collection(db, 'slides');

// Get all slides
export async function getSlides(): Promise<Slide[]> {
  const q = query(slidesCollectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate() // Convert Firestore Timestamp to Date
      } as Slide
  });
}

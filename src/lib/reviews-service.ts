
'use server';

import { db } from './firebase';
import { collection, getDocs, addDoc, doc, serverTimestamp, query, orderBy, runTransaction, getDoc } from 'firebase/firestore';
import type { Review, ReviewInput } from './types';
import { revalidatePath } from 'next/cache';

// This service is no longer used for adding reviews from the product page.
// It is kept for potential future use or admin panel functionality.

// Get all reviews for a specific product
export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  const reviewsCollectionRef = collection(db, 'products', productId, 'reviews');
  const q = query(reviewsCollectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate()
    } as Review;
  });
}

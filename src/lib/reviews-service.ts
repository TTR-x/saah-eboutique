
'use server';

import { db } from './firebase';
import { collection, getDocs, addDoc, doc, serverTimestamp, query, orderBy, runTransaction, increment } from 'firebase/firestore';
import type { Review, ReviewInput } from './types';
import { revalidatePath } from 'next/cache';

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

// Add a new review and update product average rating
export async function addReview(productId: string, reviewInput: ReviewInput) {
  const productDocRef = doc(db, 'products', productId);
  const reviewsCollectionRef = collection(db, 'products', productId, 'reviews');

  try {
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productDocRef);
      if (!productDoc.exists()) {
        throw new Error("Product does not exist!");
      }

      // 1. Add the new review
      const newReviewRef = doc(reviewsCollectionRef);
      transaction.set(newReviewRef, {
        ...reviewInput,
        createdAt: serverTimestamp(),
      });

      // 2. Update the product's average rating and review count
      const productData = productDoc.data();
      const currentRating = productData.rating || 0;
      const currentReviewsCount = productData.reviews || 0;
      
      const newReviewsCount = currentReviewsCount + 1;
      // Formula for new average: (old_avg * old_count + new_rating) / new_count
      const newAverageRating = (currentRating * currentReviewsCount + reviewInput.rating) / newReviewsCount;

      transaction.update(productDocRef, {
        reviews: increment(1),
        rating: newAverageRating,
      });
    });

    revalidatePath(`/products/${productId}`);

  } catch (e) {
    console.error("Transaction failed: ", e);
    throw new Error("Failed to submit review.");
  }
}

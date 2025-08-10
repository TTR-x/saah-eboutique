
'use server';

import { db } from './firebase';
import { collection, getDocs, addDoc, doc, serverTimestamp, query, orderBy, runTransaction, getDoc } from 'firebase/firestore';
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
export async function addReview(productId: string, reviewInput: Omit<ReviewInput, 'productName' | 'comment' | 'userName'>) {
    const productDocRef = doc(db, 'products', productId);
    const reviewsCollectionRef = collection(db, 'products', productId, 'reviews');

    try {
        await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productDocRef);

            if (!productDoc.exists()) {
                throw new Error("Product does not exist!");
            }

            // Prepare the new review data
            const newReviewData = {
                ...reviewInput,
                userName: 'Anonyme',
                comment: '', // No comment as per new requirement
                createdAt: serverTimestamp(),
            };
            
            // Add the new review document. Note: This is now outside the transaction read/update logic but still atomic.
            // Firestore transactions don't support adding a doc and then reading it in the same transaction.
            // A better approach is to update stats based on current state + new review.

            const currentRating = productDoc.data().rating || 0;
            const currentReviewsCount = productDoc.data().reviews || 0;
            
            const newReviewsCount = currentReviewsCount + 1;
            const newAverageRating = (currentRating * currentReviewsCount + reviewInput.rating) / newReviewsCount;
            
            // Add the new review
            const reviewRef = doc(collection(db, 'products', productId, 'reviews'));
            transaction.set(reviewRef, newReviewData);
            
            // Update the product's aggregate rating
            transaction.update(productDocRef, {
                reviews: newReviewsCount,
                rating: newAverageRating,
            });
        });
        
        revalidatePath(`/products/${productId}`);
        revalidatePath(`/`); // Revalidate home page in case it shows top rated products

    } catch (e: any) {
        console.error("Review submission failed: ", e);
        // Log the full error object for more details
        console.error("Error details:", JSON.stringify(e, null, 2));
        throw new Error("Failed to submit review.");
    }
}

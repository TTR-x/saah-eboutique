
'use server';

import { db } from './firebase';
import { collection, getDocs, addDoc, doc, serverTimestamp, query, orderBy, runTransaction } from 'firebase/firestore';
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
        console.log(`Adding review for product: ${productId}`);
        // Step 1: Add the new review document.
        await addDoc(reviewsCollectionRef, {
            ...reviewInput,
            createdAt: serverTimestamp(),
        });
        console.log("Review document successfully added.");

        // Step 2: Update the product's average rating and review count in a transaction.
        await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productDocRef);

            if (!productDoc.exists()) {
                throw new Error("Product does not exist!");
            }

            const productData = productDoc.data();
            const currentRating = productData.rating || 0;
            const currentReviewsCount = productData.reviews || 0;
            
            const newReviewsCount = currentReviewsCount + 1;
            const newAverageRating = (currentRating * currentReviewsCount + reviewInput.rating) / newReviewsCount;

            console.log(`Updating product rating. Old count: ${currentReviewsCount}, New count: ${newReviewsCount}. Old rating: ${currentRating}, New rating: ${newAverageRating}`);

            transaction.update(productDocRef, {
                reviews: newReviewsCount,
                rating: newAverageRating,
            });
        });
        
        console.log("Product rating successfully updated.");

        revalidatePath(`/products/${productId}`);

    } catch (e: any) {
        console.error("Transaction failed: ", e);
        // Log the full error object for more details
        console.error("Error details:", JSON.stringify(e, null, 2));
        throw new Error("Failed to submit review.");
    }
}

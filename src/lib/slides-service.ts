
'use server'

import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import { uploadImage, deleteImage } from './cloudinary';
import type { Slide, SlideInput } from './types';
import { revalidatePath } from 'next/cache';

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

// Add a new slide
export async function addSlide(slideInput: SlideInput) {
    if (!slideInput.image) {
        throw new Error("Image is required");
    }

    // Upload image to Cloudinary
    const { secure_url, public_id } = await uploadImage(slideInput.image, "slides");

    // Add slide data to Firestore
    const newSlide = {
        title: slideInput.title,
        subtitle: slideInput.subtitle,
        imageUrl: secure_url,
        publicId: public_id,
        createdAt: serverTimestamp()
    };
    
    await addDoc(slidesCollectionRef, newSlide);
    revalidatePath('/'); // Invalidate cache for home page
    revalidatePath('/admin/slides'); // Invalidate cache for admin slides page
}

// Delete a slide
export async function deleteSlide(id: string) {
    const slideDocRef = doc(db, 'slides', id);
    const slideDoc = await getDoc(slideDocRef);
    
    if (!slideDoc.exists()) {
        throw new Error("Slide not found");
    }

    const slideData = slideDoc.data();
    const publicId = slideData.publicId;

    if (publicId) {
        await deleteImage(publicId);
    }

    await deleteDoc(slideDocRef);
    revalidatePath('/');
    revalidatePath('/admin/slides');
}

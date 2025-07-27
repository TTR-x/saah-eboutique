
'use server'

import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import { uploadImage, deleteImage } from './cloudinary';
import type { Slide, SlideInput } from './types';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { dbAdmin } from './firebase-admin';

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
    
    await dbAdmin.collection('slides').add(newSlide);
    revalidatePath('/'); // Invalidate cache for home page
    revalidatePath('/admin/slides'); // Invalidate cache for admin slides page
}

// Delete a slide
export async function deleteSlide(id: string) {
    const slideDocRef = dbAdmin.collection('slides').doc(id);
    const slideDoc = await slideDocRef.get();
    
    if (!slideDoc.exists) {
        throw new Error("Slide not found");
    }

    const slideData = slideDoc.data();
    if (slideData && slideData.publicId) {
        const publicId = slideData.publicId;
        await deleteImage(publicId);
    }

    await slideDocRef.delete();
    revalidatePath('/');
    revalidatePath('/admin/slides');
}

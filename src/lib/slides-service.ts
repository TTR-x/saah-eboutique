
'use server'

import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { uploadImage, deleteImage } from './cloudinary';
import type { Slide, SlideInput } from './types';
import { revalidatePath } from 'next/cache';

const slidesCollectionRef = collection(db, 'slides');

// Get all slides
export async function getSlides(): Promise<Slide[]> {
  const q = query(slidesCollectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slide));
}

// Add a new slide
export async function addSlide(slideInput: SlideInput) {
    if (!slideInput.image) {
        throw new Error("Image is required");
    }

    // Upload image to Cloudinary
    const { secure_url, public_id } = await uploadImage(slideInput.image);

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
    const slideToDelete = slides.find(slide => slide.id === id); // This needs to be fetched from firestore
    
    // For now we assume we have public_id, but it should be fetched from firestore
    // const publicId = slideToDelete.publicId; 
    // await deleteImage(publicId);

    const slideDocRef = doc(db, 'slides', id);
    await deleteDoc(slideDocRef);
    revalidatePath('/');
    revalidatePath('/admin/slides');
}

// Dummy data for now, will be replaced with Firestore fetch
const slides = [] as Slide[];

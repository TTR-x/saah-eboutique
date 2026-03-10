import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { Testimonial, TestimonialInput } from './types';

const testimonialsCollectionRef = collection(db, 'testimonials');

export async function addTestimonial(testimonialInput: TestimonialInput) {
    const newTestimonial = {
        ...testimonialInput,
        createdAt: serverTimestamp()
    };
    
    await addDoc(testimonialsCollectionRef, newTestimonial);
}

export async function getTestimonials(): Promise<Testimonial[]> {
    const q = query(testimonialsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
        } as Testimonial;
    });
}

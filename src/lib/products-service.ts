
'use server'

import { adminDb } from './firebase-admin';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import { uploadImage, deleteImage } from './cloudinary';
import type { Product, ProductInput } from './types';
import { revalidatePath } from 'next/cache';
import { db } from './firebase'; // Keep for client-side fetches

const productsCollectionRef = collection(db, 'products');

export async function getProducts(): Promise<Product[]> {
    const q = query(productsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
        } as Product
    });
}

export async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate()
        } as Product;
    } else {
        return null;
    }
}


export async function addProduct(productInput: Omit<ProductInput, 'images'> & { images: File[] }) {
    if (!productInput.images || productInput.images.length === 0) {
        throw new Error("At least one image is required");
    }

    const imageUrls: string[] = [];
    const imagePublicIds: string[] = [];

    for (const image of productInput.images) {
        const { secure_url, public_id } = await uploadImage(image, "products");
        imageUrls.push(secure_url);
        imagePublicIds.push(public_id);
    }

    const newProduct = {
        ...productInput,
        images: imageUrls,
        imagePublicIds: imagePublicIds,
        rating: 0,
        reviews: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await adminDb.collection('products').add(newProduct);

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${newProduct.name.toLowerCase().replace(/ /g, '-')}`);
    revalidatePath('/admin/products');
}

export async function deleteProduct(id: string) {
    const productDocRef = adminDb.collection('products').doc(id);
    const productDoc = await productDocRef.get();

    if (!productDoc.exists) {
        throw new Error("Product not found");
    }

    const productData = productDoc.data() as Product;
    if (productData.imagePublicIds) {
        for (const publicId of productData.imagePublicIds) {
            await deleteImage(publicId);
        }
    }

    await productDocRef.delete();
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
}

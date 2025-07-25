
'use server'

import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import { uploadImage, deleteImage } from './cloudinary';
import type { Product, ProductInput } from './types';
import { revalidatePath } from 'next/cache';

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
        createdAt: serverTimestamp()
    };
    
    await addDoc(productsCollectionRef, newProduct);
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
}

export async function deleteProduct(id: string) {
    const productDocRef = doc(db, 'products', id);
    const productDoc = await getDoc(productDocRef);

    if (!productDoc.exists()) {
        throw new Error("Product not found");
    }

    const productData = productDoc.data() as Product;
    if (productData.imagePublicIds) {
        for (const publicId of productData.imagePublicIds) {
            await deleteImage(publicId);
        }
    }

    await deleteDoc(productDocRef);
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
}

'use server'

import { v2 as cloudinary } from 'cloudinary';
import { db } from './firebase';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function uploadImage(file: File, upload_preset: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  const results = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        upload_preset: upload_preset,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    ).end(buffer);
  });

  return results as { secure_url: string; public_id: string };
}

async function deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
}

export async function addProductAction(productData: any, images: FormData) {
    const imageUrls: string[] = [];
    const imagePublicIds: string[] = [];

    for (const file of images.values()) {
        const { secure_url, public_id } = await uploadImage(file as File, "products");
        imageUrls.push(secure_url);
        imagePublicIds.push(public_id);
    }

    const finalProductData = {
        ...productData,
        images: imageUrls,
        imagePublicIds: imagePublicIds,
        createdAt: new Date(),
    };

    await addDoc(collection(db, 'products'), finalProductData);
    revalidatePath('/admin/products');
}

export async function deleteProductAction(productId: string, imagePublicIds: string[]) {
    if (imagePublicIds) {
        for (const publicId of imagePublicIds) {
            await deleteImage(publicId);
        }
    }
    await deleteDoc(doc(db, "products", productId));
    revalidatePath('/admin/products');
}

export async function addSlideAction(slideData: any, image: File) {
    const { secure_url, public_id } = await uploadImage(image, "slides");
    
    const finalSlideData = {
        ...slideData,
        imageUrl: secure_url,
        publicId: public_id,
        createdAt: new Date()
    };

    await addDoc(collection(db, 'slides'), finalSlideData);
    revalidatePath('/admin/slides');
}

export async function deleteSlideAction(slideId: string, publicId: string) {
    await deleteImage(publicId);
    await deleteDoc(doc(db, "slides", slideId));
    revalidatePath('/admin/slides');
}

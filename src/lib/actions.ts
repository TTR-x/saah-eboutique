'use server'

import { v2 as cloudinary } from 'cloudinary';

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

export async function addImageUploadAction(images: FormData, upload_preset: string) {
    const uploadedImages: { secure_url: string; public_id: string }[] = [];

    for (const file of images.values()) {
        const result = await uploadImage(file as File, upload_preset);
        uploadedImages.push(result);
    }
    
    return uploadedImages;
}

export async function deleteImageAction(publicIds: string[]) {
    for (const publicId of publicIds) {
        await cloudinary.uploader.destroy(publicId);
    }
}

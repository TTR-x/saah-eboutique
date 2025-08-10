
'use server'

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function uploadImageFromDataUri(dataUri: string, folder: string) {
  const results = await cloudinary.uploader.upload(dataUri, {
    folder: folder,
    resource_type: 'image',
  });
  return results as { secure_url: string; public_id: string };
}

export async function addImageUploadAction(dataUris: string[], folder: string) {
    const uploadedImages: { secure_url: string; public_id: string }[] = [];
    
    for (const uri of dataUris) {
        const result = await uploadImageFromDataUri(uri, folder);
        uploadedImages.push(result);
    }
    
    return uploadedImages;
}

export async function deleteImageAction(publicIds: string[]) {
    for (const publicId of publicIds) {
        await cloudinary.uploader.destroy(publicId);
    }
}

    

'use server'

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function addImageUploadAction(dataUri: string, folder: string) {
  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      resource_type: 'image',
    });
    return result as { secure_url: string; public_id: string };
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    // Rethrow a more specific error to be caught in the form handler
    throw new Error(`Échec du téléchargement de l'image sur Cloudinary: ${error.message}`);
  }
}

export async function deleteImageAction(publicIds: string[]) {
    for (const publicId of publicIds) {
        await cloudinary.uploader.destroy(publicId);
    }
}

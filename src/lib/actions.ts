
'use server'

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function deleteImageAction(publicIds: string[]) {
    if (!publicIds || publicIds.length === 0) {
        return;
    }
    try {
        for (const publicId of publicIds) {
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
        // We don't re-throw the error to avoid blocking the product deletion/update process
        // if only image deletion fails. The error is logged for maintenance.
    }
}

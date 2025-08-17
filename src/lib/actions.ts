
'use server'

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


// This function is for direct signed uploads from the client
export async function getCloudinarySignature() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: 'products'
    },
    process.env.CLOUDINARY_API_SECRET!
  );
  return { timestamp, signature };
}


export async function deleteImageAction(publicIds: string[]) {
    for (const publicId of publicIds) {
        await cloudinary.uploader.destroy(publicId);
    }
}

    
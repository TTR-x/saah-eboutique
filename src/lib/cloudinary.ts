
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  const results = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'saah-business-hub',
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

export async function deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
}

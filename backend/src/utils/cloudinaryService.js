import cloudinary from "../config/cloudinary.js";
import { AppError } from "./appError.js";

export function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function ensureConfigured() {
  if (!hasCloudinaryConfig()) {
    throw new AppError("Cloudinary storage is enabled, but credentials are missing in backend/.env.", 503);
  }
}

export function formatAsset(asset, file) {
  if (!asset) {
    return null;
  }

  return {
    storage: "cloudinary",
    public_id: asset.public_id,
    secure_url: asset.secure_url,
    resource_type: asset.resource_type,
    format: asset.format,
    file_type: file?.mimetype || null,
    original_filename: file?.originalname || asset.original_filename || null,
    size: asset.bytes || null,
    uploaded_at: asset.created_at || new Date().toISOString()
  };
}

export async function uploadToCloudinary(file, folder, resourceType = "auto") {
  if (!file) {
    return null;
  }

  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType
      },
      (error, result) => {
        if (error) {
          reject(new AppError(error.message || "Cloudinary upload failed", 500));
          return;
        }

        resolve(formatAsset(result, file));
      }
    );

    stream.end(file.buffer);
  });
}

export async function deleteFromCloudinary(publicId, resourceType = "image") {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType
  });
}

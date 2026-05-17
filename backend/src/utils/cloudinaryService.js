import cloudinary from "../config/cloudinary.js";
import { AppError } from "./appError.js";

const LARGE_RAW_UPLOAD_THRESHOLD = 20 * 1024 * 1024;
const LARGE_RAW_UPLOAD_CHUNK_SIZE = 6 * 1024 * 1024;

function sanitizePublicIdSegment(value) {
  return String(value || "file")
    .replace(/[^a-zA-Z0-9-_.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildRawUploadPublicId(file) {
  const originalName = file?.originalname || "file";
  const lastDotIndex = originalName.lastIndexOf(".");
  const name = lastDotIndex > -1 ? originalName.slice(0, lastDotIndex) : originalName;
  const extension = lastDotIndex > -1 ? originalName.slice(lastDotIndex).toLowerCase() : "";

  return `${Date.now()}-${sanitizePublicIdSegment(name) || "file"}${extension}`;
}

function normalizeDeliveryUrl(url, file, asset) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }

    const extension =
      (file?.originalname?.includes(".") ? file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase() : "") ||
      (asset?.format ? `.${String(asset.format).toLowerCase()}` : "");

    if (extension && !parsed.pathname.toLowerCase().endsWith(extension)) {
      parsed.pathname = `${parsed.pathname}${extension}`;
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

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
    secure_url: normalizeDeliveryUrl(asset.secure_url, file, asset),
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
    const useChunkedUpload = resourceType === "raw" && Number(file?.size || 0) >= LARGE_RAW_UPLOAD_THRESHOLD;
    const options = {
      folder,
      resource_type: resourceType
    };

    if (resourceType === "raw") {
      options.public_id = buildRawUploadPublicId(file);
      options.use_filename = false;
      options.unique_filename = false;
      options.overwrite = false;
      options.access_mode = "public";
    }

    if (useChunkedUpload) {
      options.chunk_size = LARGE_RAW_UPLOAD_CHUNK_SIZE;
    }

    const handleResult = (error, result) => {
      if (error || result?.error) {
        const message = error?.message || result?.error?.message || "Cloudinary upload failed";
        reject(new AppError(message, 500));
        return;
      }

      resolve(formatAsset(result, file));
    };

    const stream = useChunkedUpload
      ? cloudinary.uploader.upload_chunked_stream((result) => handleResult(null, result), options)
      : cloudinary.uploader.upload_stream((error, result) => handleResult(error, result), options);

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

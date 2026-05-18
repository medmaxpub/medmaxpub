import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { buildCloudFrontFileUrl, deleteFromS3, hasS3Config, uploadBufferToS3 } from "../config/s3.js";
import { AppError } from "./appError.js";
import { deleteFromCloudinary, hasCloudinaryConfig, uploadToCloudinary } from "./cloudinaryService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsRoot = path.resolve(__dirname, "../../uploads");

function normalizeStorageMode(value) {
  const mode = value?.trim().toLowerCase();

  if (mode === "local" || mode === "cloudinary" || mode === "s3") {
    return mode;
  }

  return null;
}

function inferResourceType(fileType) {
  if (!fileType) {
    return "raw";
  }

  if (fileType.startsWith("image/")) {
    return "image";
  }

  if (fileType.startsWith("video/")) {
    return "video";
  }

  return "raw";
}

function sanitizeSegment(value) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function hasRawPresentationExtension(filename = "") {
  const extension = path.extname(String(filename || "")).toLowerCase();
  return extension === ".ppt" || extension === ".pptx" || extension === ".odp";
}

function isConvertiblePresentationFile(file) {
  const mimeType = String(file?.mimetype || "").toLowerCase();

  return (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "application/vnd.oasis.opendocument.presentation" ||
    hasRawPresentationExtension(file?.originalname)
  );
}

function buildLocalFilename(file) {
  const extension = path.extname(file?.originalname || "").toLowerCase();
  const baseName = path.basename(file?.originalname || "file", extension);
  const safeBaseName = sanitizeSegment(baseName) || "file";

  return `${Date.now()}-${safeBaseName}${extension}`;
}

function buildPublicFilePath(relativePath) {
  return relativePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getBaseUrl(req) {
  if (process.env.BACKEND_PUBLIC_URL) {
    return process.env.BACKEND_PUBLIC_URL.replace(/\/$/, "");
  }

  if (req) {
    return `${req.protocol}://${req.get("host")}`;
  }

  return `http://localhost:${process.env.PORT || 5000}`;
}

function formatLocalAsset(relativePath, file, resourceType, req) {
  const normalizedPath = relativePath.split(path.sep).join("/");

  return {
    storage: "local",
    public_id: normalizedPath,
    secure_url: `${getBaseUrl(req)}/uploads/${buildPublicFilePath(normalizedPath)}`,
    resource_type: resourceType === "auto" ? inferResourceType(file?.mimetype) : resourceType,
    format: path.extname(file?.originalname || "").replace(".", "").toLowerCase() || null,
    file_type: file?.mimetype || null,
    original_filename: file?.originalname || null,
    size: file?.size || null,
    uploaded_at: new Date().toISOString()
  };
}

function formatS3Asset(key, url, file, resourceType) {
  return {
    storage: "s3",
    public_id: key,
    secure_url: url,
    resource_type: resourceType === "auto" ? inferResourceType(file?.mimetype) : resourceType,
    format: path.extname(file?.originalname || "").replace(".", "").toLowerCase() || null,
    file_type: file?.mimetype || null,
    original_filename: file?.originalname || null,
    size: file?.size || null,
    uploaded_at: new Date().toISOString()
  };
}

function resolveLocalAssetPath(relativePath) {
  const normalizedRelativePath = relativePath.split("/").join(path.sep);
  const absolutePath = path.resolve(uploadsRoot, normalizedRelativePath);

  if (!absolutePath.startsWith(uploadsRoot)) {
    throw new Error("Invalid local asset path");
  }

  return absolutePath;
}

export function resolveStoredAssetPath(asset) {
  if (!asset?.public_id) {
    throw new Error("Asset path is missing");
  }

  const storage = asset.storage || (asset.secure_url?.includes("/uploads/") ? "local" : "cloudinary");

  if (storage !== "local") {
    throw new Error("Only local assets can be resolved to disk paths");
  }

  return resolveLocalAssetPath(asset.public_id);
}

export function getStorageMode() {
  const configuredMode = normalizeStorageMode(process.env.FILE_STORAGE);

  if (configuredMode) {
    return configuredMode;
  }

  if (process.env.NODE_ENV === "production" && hasS3Config()) {
    return "s3";
  }

  if (process.env.NODE_ENV === "production" && hasCloudinaryConfig()) {
    return "cloudinary";
  }

  return "local";
}

export async function ensureUploadsDirectory() {
  await fs.mkdir(uploadsRoot, { recursive: true });
}

async function writeAssetLocally(file, folder, resourceType, req) {
  const safeFolderPath = folder
    .split("/")
    .filter(Boolean)
    .map((segment) => sanitizeSegment(segment) || "files")
    .join(path.sep);

  const targetDirectory = path.join(uploadsRoot, safeFolderPath);
  await fs.mkdir(targetDirectory, { recursive: true });

  const localFilename = buildLocalFilename(file);
  const absolutePath = path.join(targetDirectory, localFilename);
  await fs.writeFile(absolutePath, file.buffer);

  const relativePath = path.relative(uploadsRoot, absolutePath);
  return formatLocalAsset(relativePath, file, resourceType, req);
}

async function writeAssetToS3(file, folder, resourceType) {
  const uploaded = await uploadBufferToS3({
    buffer: file.buffer,
    fileName: file.originalname || "file",
    contentType: file.mimetype || "application/octet-stream",
    folder
  });

  return formatS3Asset(uploaded.key, uploaded.url, file, resourceType);
}

export async function uploadAsset(file, folder, resourceType = "auto", req) {
  if (!file) {
    return null;
  }

  const storageMode = getStorageMode();

  if (storageMode === "s3") {
    return writeAssetToS3(file, folder, resourceType);
  }

  if (storageMode === "cloudinary") {
    try {
      return await uploadToCloudinary(file, folder, resourceType);
    } catch (error) {
      const shouldFallbackToLocal =
        resourceType === "raw" &&
        isConvertiblePresentationFile(file) &&
        isCloudinaryRawFileSizeLimitError(error);

      if (!shouldFallbackToLocal) {
        throw error instanceof AppError ? error : new AppError(error?.message || "Asset upload failed", 500);
      }
    }
  }

  return writeAssetLocally(file, folder, resourceType, req);
}

export async function deleteAsset(asset, fallbackResourceType = "image") {
  if (!asset) {
    return;
  }

  const storage =
    asset.storage ||
    (asset.secure_url?.includes("/uploads/") ? "local" : asset.secure_url?.includes("cloudfront.net") ? "s3" : "cloudinary");

  if (storage === "s3") {
    await deleteFromS3(asset.public_id);
    return;
  }

  if (storage === "cloudinary") {
    await deleteFromCloudinary(asset.public_id, asset.resource_type || fallbackResourceType);
    return;
  }

  if (!asset.public_id) {
    return;
  }

  const absolutePath = resolveLocalAssetPath(asset.public_id);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

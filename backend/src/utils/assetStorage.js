import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { deleteFromCloudinary, hasCloudinaryConfig, uploadToCloudinary } from "./cloudinaryService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsRoot = path.resolve(__dirname, "../../uploads");

function normalizeStorageMode(value) {
  const mode = value?.trim().toLowerCase();

  if (mode === "local" || mode === "cloudinary") {
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

  if (process.env.NODE_ENV === "production" && hasCloudinaryConfig()) {
    return "cloudinary";
  }

  return "local";
}

export async function ensureUploadsDirectory() {
  await fs.mkdir(uploadsRoot, { recursive: true });
}

export async function uploadAsset(file, folder, resourceType = "auto", req) {
  if (!file) {
    return null;
  }

  if (getStorageMode() === "cloudinary") {
    return uploadToCloudinary(file, folder, resourceType);
  }

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

export async function deleteAsset(asset, fallbackResourceType = "image") {
  if (!asset) {
    return;
  }

  const storage = asset.storage || (asset.secure_url?.includes("/uploads/") ? "local" : "cloudinary");

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

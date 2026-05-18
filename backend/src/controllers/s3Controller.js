import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import { s3Client, s3Config } from "../config/s3.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const SIGNED_URL_TTL_SECONDS = 60 * 5;
const allowedFileTypes = {
  "application/vnd.ms-powerpoint": { folder: "uploads/ppt", extensions: [".ppt"] },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { folder: "uploads/ppt", extensions: [".pptx"] },
  "application/pdf": { folder: "uploads/pdf", extensions: [".pdf"] },
  "image/jpeg": { folder: "uploads/images", extensions: [".jpg", ".jpeg"] },
  "image/png": { folder: "uploads/images", extensions: [".png"] }
};

function normalizeValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureS3Configured() {
  if (!s3Config.bucketName) {
    throw new AppError("AWS_BUCKET_NAME is not configured on the server.", 503);
  }

  if (!s3Config.cloudfrontUrl) {
    throw new AppError("CLOUDFRONT_URL is not configured on the server.", 503);
  }
}

function sanitizeBaseName(value) {
  return value
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveAllowedFile(fileName, fileType) {
  const normalizedFileName = normalizeValue(fileName);
  const normalizedFileType = normalizeValue(fileType).toLowerCase();
  const allowedType = allowedFileTypes[normalizedFileType];

  if (!normalizedFileName || !normalizedFileType) {
    throw new AppError("fileName and fileType are required.", 400);
  }

  if (!allowedType) {
    throw new AppError("Unsupported file type. Only ppt, pptx, pdf, jpg, jpeg, and png are allowed.", 400);
  }

  const extension = path.extname(normalizedFileName).toLowerCase();

  if (!extension || !allowedType.extensions.includes(extension)) {
    throw new AppError("The file extension does not match the selected file type.", 400);
  }

  const baseName = sanitizeBaseName(path.basename(normalizedFileName, extension)) || "file";

  return {
    extension,
    folder: allowedType.folder,
    baseName,
    fileType: normalizedFileType
  };
}

function buildFileUrl(key) {
  return `${s3Config.cloudfrontUrl}/${key}`;
}

export const generateSignedUploadUrl = asyncHandler(async (req, res) => {
  ensureS3Configured();

  const { fileName, fileType } = req.body || {};
  const resolved = resolveAllowedFile(fileName, fileType);
  const uniqueId = crypto.randomUUID();
  const key = `${resolved.folder}/${Date.now()}-${uniqueId}-${resolved.baseName}${resolved.extension}`;

  const command = new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    ContentType: resolved.fileType
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: SIGNED_URL_TTL_SECONDS
  });

  res.status(200).json({
    success: true,
    uploadUrl,
    key,
    fileUrl: buildFileUrl(key)
  });
});

export const deleteS3File = asyncHandler(async (req, res) => {
  ensureS3Configured();

  const key = normalizeValue(req.body?.key);

  if (!key) {
    throw new AppError("key is required.", 400);
  }

  if (!key.startsWith("uploads/")) {
    throw new AppError("Only files inside uploads/ can be deleted.", 400);
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key
    })
  );

  res.status(200).json({
    success: true,
    message: "File deleted successfully."
  });
});

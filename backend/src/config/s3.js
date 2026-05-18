import "./env.js";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";

const region = process.env.AWS_REGION?.trim() || "ap-south-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim() || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim() || "";
const bucketName = process.env.AWS_BUCKET_NAME?.trim() || "";
const cloudfrontUrl = (process.env.CLOUDFRONT_URL || "").trim().replace(/\/+$/, "");

export const s3Config = {
  region,
  bucketName,
  cloudfrontUrl
};

export const s3Client = new S3Client({
  region,
  credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined
});

export function hasS3Config() {
  return Boolean(region && accessKeyId && secretAccessKey && bucketName && cloudfrontUrl);
}

function sanitizeSegment(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9-_.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildObjectKey(folder, fileName) {
  const extension = path.extname(fileName || "").toLowerCase();
  const baseName = sanitizeSegment(path.basename(fileName || "file", extension)) || "file";
  const safeFolder = String(folder || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => sanitizeSegment(segment) || "files")
    .join("/");

  return `${safeFolder}/${Date.now()}-${baseName}${extension}`;
}

export function buildCloudFrontFileUrl(key) {
  return `${cloudfrontUrl}/${String(key || "").replace(/^\/+/, "")}`;
}

export async function uploadBufferToS3({ buffer, fileName, contentType, folder }) {
  const key = buildObjectKey(folder, fileName);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream"
    })
  );

  return {
    key,
    url: buildCloudFrontFileUrl(key)
  };
}

export async function deleteFromS3(key) {
  if (!key) {
    return;
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    })
  );
}

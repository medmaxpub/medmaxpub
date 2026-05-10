import path from "path";
import Ppt from "../models/Ppt.js";
import { uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { generatePreviewAssetFromStoredFile, generatePreviewAssetFromUpload } from "../utils/pptPreviewService.js";

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
}

function normalizeUrlProtocol(url) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol === "http:" && !isLocalHostname(parsed.hostname)) {
      parsed.protocol = "https:";
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

function getAssetExtension(asset) {
  const fromFilename = path.extname(asset?.original_filename || "");

  if (fromFilename) {
    return fromFilename.toLowerCase();
  }

  if (asset?.format) {
    return `.${String(asset.format).toLowerCase()}`;
  }

  return "";
}

function appendAssetExtension(url, asset) {
  if (!url) {
    return null;
  }

  const extension = getAssetExtension(asset);

  if (!extension) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (!parsed.pathname.toLowerCase().endsWith(extension)) {
      parsed.pathname = `${parsed.pathname}${extension}`;
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

export function normalizeStoredAssetUrl(url, asset) {
  return appendAssetExtension(normalizeUrlProtocol(url), asset);
}

export function resolvePptFileAsset(ppt) {
  return ppt?.file || ppt?.pptFile || ppt?._doc?.file || ppt?._doc?.pptFile || null;
}

export function resolvePptPreviewAsset(ppt) {
  return ppt?.previewFile || ppt?.pdfPreviewFile || ppt?._doc?.previewFile || ppt?._doc?.pdfPreviewFile || null;
}

export async function createPptRecord({ journalId, title, description, pptUpload, previewUpload, req }) {
  if (!pptUpload) {
    throw new AppError("PPT or PPTX file is required", 400);
  }

  const pptAsset = await uploadAsset(pptUpload, "medmaxpub/ppts", "raw", req);
  const previewAsset =
    (await uploadAsset(previewUpload, "medmaxpub/ppts-previews", "raw", req)) ||
    (await generatePreviewAssetFromUpload(pptUpload, req));

  return Ppt.create({
    journal: journalId,
    title,
    description,
    file: pptAsset,
    previewFile: previewAsset,
    pptUrl: normalizeStoredAssetUrl(pptAsset?.secure_url, pptAsset),
    pptPublicId: pptAsset?.public_id || null,
    previewPdfUrl: normalizeStoredAssetUrl(previewAsset?.secure_url, previewAsset),
    previewPublicId: previewAsset?.public_id || null
  });
}

export async function ensurePptPreviewAsset(ppt, req) {
  const pptAsset = resolvePptFileAsset(ppt);
  const previewAsset = resolvePptPreviewAsset(ppt);

  if (previewAsset || !pptAsset) {
    return ppt;
  }

  const generatedPreview = await generatePreviewAssetFromStoredFile(pptAsset, req);

  if (!generatedPreview) {
    return ppt;
  }

  ppt.previewFile = generatedPreview;
  ppt.previewPdfUrl = normalizeStoredAssetUrl(generatedPreview.secure_url, generatedPreview);
  ppt.previewPublicId = generatedPreview.public_id || null;
  await ppt.save();
  return ppt;
}

export function serializePpt(ppt) {
  const pptAsset = resolvePptFileAsset(ppt);
  const previewAsset = resolvePptPreviewAsset(ppt);
  const pptUrl = normalizeStoredAssetUrl(ppt?.pptUrl || pptAsset?.secure_url, pptAsset);
  const previewPdfUrl = normalizeStoredAssetUrl(ppt?.previewPdfUrl || previewAsset?.secure_url, previewAsset);

  return {
    id: ppt.id || ppt._id,
    title: ppt.title,
    description: ppt.description,
    uploadedDate: ppt.uploadedDate || ppt.createdAt,
    createdAt: ppt.createdAt || null,
    updatedAt: ppt.updatedAt || null,
    journal: ppt.journal || null,
    pptUrl,
    pptPublicId: ppt?.pptPublicId || pptAsset?.public_id || null,
    previewPdfUrl,
    previewPublicId: ppt?.previewPublicId || previewAsset?.public_id || null,
    file: pptAsset,
    previewFile: previewAsset,
    fileUrl: pptUrl,
    previewUrl: previewPdfUrl
  };
}

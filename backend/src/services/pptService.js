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

function determinePreviewStatus(ppt, previewAsset) {
  if (previewAsset || ppt?.previewPdfUrl) {
    return "ready";
  }

  return ppt?.previewStatus || "missing";
}

function logPptPreview(event, payload) {
  console.info(`[ppt-preview] ${event}`, payload);
}

export async function createPptRecord({ journalId, title, description, authorName, doiNumber, pptUpload, previewUpload, req }) {
  if (!pptUpload) {
    throw new AppError("PPT or PPTX file is required", 400);
  }

  const pptAsset = await uploadAsset(pptUpload, "medmaxpub/ppts", "raw", req);
  const previewAsset =
    (await uploadAsset(previewUpload, "medmaxpub/ppts-previews", "image", req)) ||
    (await generatePreviewAssetFromUpload(pptUpload, req)) ||
    (await generatePreviewAssetFromStoredFile(pptAsset, req));
  const previewStatus = previewAsset ? "ready" : "failed";
  const previewError = previewAsset ? "" : "Preview PDF generation failed";
  const pptRecord = await Ppt.create({
    journal: journalId,
    title,
    description,
    authorName,
    doiNumber,
    file: pptAsset,
    previewFile: previewAsset,
    pptFileName: pptUpload.originalname || "",
    pptUrl: normalizeStoredAssetUrl(pptAsset?.secure_url, pptAsset),
    pptPublicId: pptAsset?.public_id || null,
    previewPdfUrl: normalizeStoredAssetUrl(previewAsset?.secure_url, previewAsset),
    previewPublicId: previewAsset?.public_id || null,
    previewStatus,
    previewRequestedAt: new Date(),
    previewReadyAt: previewAsset ? new Date() : null,
    previewError
  });

  if (!previewAsset) {
    logPptPreview("create-missing-preview", {
      pptId: String(pptRecord._id),
      journalId,
      title,
      pptUrl: normalizeStoredAssetUrl(pptAsset?.secure_url, pptAsset),
      storage: pptAsset?.storage || null,
      hasManualPreviewUpload: Boolean(previewUpload)
    });
  } else {
    logPptPreview("create-ready", {
      pptId: String(pptRecord._id),
      journalId,
      title,
      pptUrl: normalizeStoredAssetUrl(pptAsset?.secure_url, pptAsset),
      previewPdfUrl: normalizeStoredAssetUrl(previewAsset?.secure_url, previewAsset),
      storage: previewAsset?.storage || null
    });
  }

  return pptRecord;
}

export async function ensurePptPreviewAsset(ppt, req, options = {}) {
  const { force = false } = options;
  const pptAsset = resolvePptFileAsset(ppt);
  const previewAsset = resolvePptPreviewAsset(ppt);

  if ((previewAsset && !force) || (!force && ppt?.previewStatus === "failed") || !pptAsset) {
    if (previewAsset) {
      ppt.previewStatus = "ready";
      ppt.previewError = "";
    }

    return ppt;
  }

  ppt.previewRequestedAt = new Date();
  ppt.previewStatus = "pending";

  const generatedPreview = await generatePreviewAssetFromStoredFile(pptAsset, req);

  if (!generatedPreview) {
    ppt.previewStatus = "failed";
    ppt.previewError = "Preview PDF generation failed";
    await ppt.save();
    logPptPreview("ensure-missing-preview", {
      pptId: String(ppt._id || ppt.id || ""),
      title: ppt.title,
      pptUrl: normalizeStoredAssetUrl(pptAsset?.secure_url, pptAsset),
      storage: pptAsset?.storage || null
    });
    return ppt;
  }

  ppt.previewFile = generatedPreview;
  ppt.previewPdfUrl = normalizeStoredAssetUrl(generatedPreview.secure_url, generatedPreview);
  ppt.previewPublicId = generatedPreview.public_id || null;
  ppt.previewStatus = "ready";
  ppt.previewReadyAt = new Date();
  ppt.previewError = "";
  await ppt.save();
  logPptPreview("ensure-ready", {
    pptId: String(ppt._id || ppt.id || ""),
    title: ppt.title,
    previewPdfUrl: ppt.previewPdfUrl,
    storage: generatedPreview?.storage || null
  });
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
    authorName: ppt.authorName || "",
    doiNumber: ppt.doiNumber || "",
    uploadedDate: ppt.uploadedDate || ppt.createdAt,
    createdAt: ppt.createdAt || null,
    updatedAt: ppt.updatedAt || null,
    journal: ppt.journal || null,
    pptFileUrl: pptUrl,
    originalPptUrl: pptUrl,
    pptFileName: ppt?.pptFileName || pptAsset?.original_filename || "",
    pptUrl,
    pptPublicId: ppt?.pptPublicId || pptAsset?.public_id || null,
    previewPdfUrl,
    previewPublicId: ppt?.previewPublicId || previewAsset?.public_id || null,
    previewStatus: determinePreviewStatus(ppt, previewAsset),
    previewError: ppt?.previewError || "",
    file: pptAsset,
    previewFile: previewAsset,
    fileUrl: pptUrl,
    previewUrl: previewPdfUrl
  };
}

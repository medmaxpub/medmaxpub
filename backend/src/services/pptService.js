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

export function resolvePptCoverAsset(ppt) {
  return ppt?.coverImage || ppt?._doc?.coverImage || null;
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

function buildPptDescription({ description, authorName, doiNumber, fallbackTitle }) {
  const explicitDescription = String(description || "").trim();

  if (explicitDescription) {
    return explicitDescription;
  }

  const derivedDescription = [authorName, doiNumber].filter(Boolean).join(" | ").trim();
  return derivedDescription || String(fallbackTitle || "").trim();
}

export async function createPptRecord({ journalId, title, description, authorName, doiNumber, pptUpload, previewUpload, coverImageUpload, req }) {
  if (!pptUpload) {
    throw new AppError("PPT or PPTX file is required", 400);
  }

  if (!coverImageUpload) {
    throw new AppError("PPT cover image is required", 400);
  }

  const coverImageAsset = await uploadAsset(coverImageUpload, "medmaxpub/ppt-covers", "image", req);
  const pptAsset = await uploadAsset(pptUpload, "medmaxpub/ppts", "raw", req);
  const normalizedPptUrl = normalizeStoredAssetUrl(pptAsset?.secure_url, pptAsset);
  const normalizedCoverImageUrl = normalizeStoredAssetUrl(coverImageAsset?.secure_url, coverImageAsset);

  if (!coverImageAsset?.public_id || !normalizedCoverImageUrl) {
    throw new AppError("PPT cover image upload failed. Please try uploading the image again.", 502);
  }

  if (!pptAsset?.public_id || !normalizedPptUrl) {
    throw new AppError("PPT upload failed to produce a valid file URL. Please try uploading the file again.", 502);
  }

  const previewAsset =
    (await uploadAsset(previewUpload, "medmaxpub/ppts-previews", "image", req)) ||
    (await generatePreviewAssetFromUpload(pptUpload, req)) ||
    (await generatePreviewAssetFromStoredFile(pptAsset, req));
  const previewStatus = previewAsset ? "ready" : "failed";
  const previewError = previewAsset ? "" : "Preview PDF generation failed";
  const pptRecord = await Ppt.create({
    journal: journalId,
    title,
    description: buildPptDescription({ description, authorName, doiNumber, fallbackTitle: title }),
    authorName,
    doiNumber,
    coverImage: coverImageAsset,
    coverImageUrl: normalizedCoverImageUrl,
    file: pptAsset,
    previewFile: previewAsset,
    pptFileName: pptUpload.originalname || "",
    pptUrl: normalizedPptUrl,
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
      pptUrl: normalizedPptUrl,
      storage: pptAsset?.storage || null,
      hasManualPreviewUpload: Boolean(previewUpload)
    });
  } else {
    logPptPreview("create-ready", {
      pptId: String(pptRecord._id),
      journalId,
      title,
      pptUrl: normalizedPptUrl,
      previewPdfUrl: normalizeStoredAssetUrl(previewAsset?.secure_url, previewAsset),
      storage: previewAsset?.storage || null
    });
  }

  return pptRecord;
}

export async function updatePptRecord({
  ppt,
  journalId,
  title,
  description,
  authorName,
  doiNumber,
  pptUpload,
  previewUpload,
  coverImageUpload,
  req,
  deleteAsset
}) {
  const nextCoverImageAsset = coverImageUpload ? await uploadAsset(coverImageUpload, "medmaxpub/ppt-covers", "image", req) : null;
  const nextPptAsset = pptUpload ? await uploadAsset(pptUpload, "medmaxpub/ppts", "raw", req) : null;
  const nextPreviewAsset = previewUpload ? await uploadAsset(previewUpload, "medmaxpub/ppts-previews", "image", req) : null;

  if (coverImageUpload && (!nextCoverImageAsset?.public_id || !normalizeStoredAssetUrl(nextCoverImageAsset?.secure_url, nextCoverImageAsset))) {
    throw new AppError("PPT cover image upload failed. Please try uploading the image again.", 502);
  }

  if (pptUpload && (!nextPptAsset?.public_id || !normalizeStoredAssetUrl(nextPptAsset?.secure_url, nextPptAsset))) {
    throw new AppError("PPT upload failed to produce a valid file URL. Please try uploading the file again.", 502);
  }

  if (nextCoverImageAsset) {
    await deleteAsset(resolvePptCoverAsset(ppt), "image");
    ppt.coverImage = nextCoverImageAsset;
    ppt.coverImageUrl = normalizeStoredAssetUrl(nextCoverImageAsset.secure_url, nextCoverImageAsset);
  }

  if (nextPptAsset) {
    await deleteAsset(resolvePptFileAsset(ppt), "raw");
    ppt.file = nextPptAsset;
    ppt.pptFile = undefined;
    ppt.pptFileName = pptUpload?.originalname || "";
    ppt.pptUrl = normalizeStoredAssetUrl(nextPptAsset.secure_url, nextPptAsset);
    ppt.pptPublicId = nextPptAsset.public_id || null;

    const generatedPreview =
      nextPreviewAsset ||
      (await generatePreviewAssetFromUpload(pptUpload, req)) ||
      (await generatePreviewAssetFromStoredFile(nextPptAsset, req));

    await deleteAsset(resolvePptPreviewAsset(ppt), "image");
    ppt.previewFile = generatedPreview;
    ppt.pdfPreviewFile = undefined;
    ppt.previewPdfUrl = normalizeStoredAssetUrl(generatedPreview?.secure_url, generatedPreview);
    ppt.previewPublicId = generatedPreview?.public_id || null;
    ppt.previewStatus = generatedPreview ? "ready" : "failed";
    ppt.previewError = generatedPreview ? "" : "Preview PDF generation failed";
    ppt.previewRequestedAt = new Date();
    ppt.previewReadyAt = generatedPreview ? new Date() : null;
  } else if (nextPreviewAsset) {
    await deleteAsset(resolvePptPreviewAsset(ppt), "image");
    ppt.previewFile = nextPreviewAsset;
    ppt.pdfPreviewFile = undefined;
    ppt.previewPdfUrl = normalizeStoredAssetUrl(nextPreviewAsset.secure_url, nextPreviewAsset);
    ppt.previewPublicId = nextPreviewAsset.public_id || null;
    ppt.previewStatus = "ready";
    ppt.previewError = "";
    ppt.previewRequestedAt = new Date();
    ppt.previewReadyAt = new Date();
  }

  ppt.journal = journalId;
  ppt.title = title;
  ppt.authorName = authorName || "";
  ppt.doiNumber = doiNumber || "";
  ppt.description = buildPptDescription({
    description,
    authorName: authorName || "",
    doiNumber: doiNumber || "",
    fallbackTitle: title
  });

  await ppt.save();
  return ppt;
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
  const coverImageAsset = resolvePptCoverAsset(ppt);
  const previewAsset = resolvePptPreviewAsset(ppt);
  const pptUrl = normalizeStoredAssetUrl(ppt?.pptUrl || pptAsset?.secure_url, pptAsset);
  const coverImageUrl = normalizeStoredAssetUrl(ppt?.coverImageUrl || coverImageAsset?.secure_url, coverImageAsset);
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
    coverImageUrl,
    pptFileUrl: pptUrl,
    originalPptUrl: pptUrl,
    pptFileName: ppt?.pptFileName || pptAsset?.original_filename || "",
    pptUrl,
    pptPublicId: ppt?.pptPublicId || pptAsset?.public_id || null,
    previewPdfUrl,
    previewPublicId: ppt?.previewPublicId || previewAsset?.public_id || null,
    previewStatus: determinePreviewStatus(ppt, previewAsset),
    previewError: ppt?.previewError || "",
    coverImage: coverImageAsset,
    file: pptAsset,
    previewFile: previewAsset,
    fileUrl: pptUrl,
    previewUrl: previewPdfUrl
  };
}

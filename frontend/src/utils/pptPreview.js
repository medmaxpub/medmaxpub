import { getJournalRouteSlug } from "./journalLinks";

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
    return null;
  }
}

function getAssetExtension(asset) {
  if (asset?.original_filename?.includes(".")) {
    return asset.original_filename.slice(asset.original_filename.lastIndexOf(".")).toLowerCase();
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

export function normalizeAssetUrl(url, asset) {
  return appendAssetExtension(normalizeUrlProtocol(url), asset);
}

export function isEmbeddableUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocalHostname(parsed.hostname));
  } catch {
    return false;
  }
}

export function canUseGoogleViewer(url) {
  if (!isEmbeddableUrl(url)) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !isLocalHostname(parsed.hostname);
  } catch {
    return false;
  }
}

export function buildGoogleViewerUrl(url) {
  if (!canUseGoogleViewer(url)) {
    return null;
  }

  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
}

export function buildOfficeViewerUrl(url) {
  if (!canUseGoogleViewer(url)) {
    return null;
  }

  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}

export function buildPdfViewerUrl(url) {
  if (!isEmbeddableUrl(url)) {
    return null;
  }

  return `${url}#toolbar=1&navpanes=0&view=FitH`;
}

export function normalizePptItem(item = {}) {
  const pptAsset = item.file || item.pptFile || null;
  const previewAsset = item.previewFile || item.pdfPreviewFile || null;
  const pptUrl = normalizeAssetUrl(item.pptUrl || item.fileUrl || pptAsset?.secure_url, pptAsset);
  const previewPdfUrl = normalizeAssetUrl(
    item.previewPdfUrl || item.previewUrl || previewAsset?.secure_url,
    previewAsset
  );
  const pdfViewerUrl = buildPdfViewerUrl(previewPdfUrl);
  const googleViewerUrl = !pdfViewerUrl ? buildGoogleViewerUrl(pptUrl) : null;
  const officeViewerUrl = !pdfViewerUrl ? buildOfficeViewerUrl(pptUrl) : null;
  const modalPreviewUrl = pdfViewerUrl || googleViewerUrl || officeViewerUrl;
  const previewIssue = !pptUrl ? "The PPT file URL is missing or invalid." : null;

  return {
    ...item,
    id: item.id || item._id,
    uploadedDate: item.uploadedDate || item.createdAt,
    file: pptAsset,
    previewFile: previewAsset,
    pptUrl,
    pptPublicId: item.pptPublicId || pptAsset?.public_id || null,
    previewPdfUrl,
    previewPublicId: item.previewPublicId || previewAsset?.public_id || null,
    pdfViewerUrl,
    googleViewerUrl,
    officeViewerUrl,
    modalPreviewUrl,
    previewIssue,
    downloadUrl: pptUrl,
    fileUrl: pptUrl,
    previewUrl: previewPdfUrl || googleViewerUrl || officeViewerUrl,
    journalTitle: item.journalTitle || item.journal?.managingJournalName || "",
    journalUrl: item.journalUrl || item.journal?.journalUrl || "",
    publicJournalUrl:
      item.publicJournalUrl ||
      item.journal?.publicJournalUrl ||
      getJournalRouteSlug(item.journalUrl || item.journal?.journalUrl || "")
  };
}

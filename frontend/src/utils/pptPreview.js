import { getJournalRouteSlug } from "./journalLinks";
import { buildAssetProxyUrl } from "./assetProxy";
import { buildPdfProxyUrl } from "./pdfProxy";

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

export function buildPdfViewerUrl(url, options = {}) {
  if (!isEmbeddableUrl(url)) {
    return null;
  }

  const {
    toolbar = 1,
    navpanes = 0,
    scrollbar = 1,
    page = 1,
    zoom = "page-width",
    view = "FitH"
  } = options;

  try {
    const parsed = new URL(url);
    parsed.hash = `toolbar=${toolbar}&navpanes=${navpanes}&scrollbar=${scrollbar}&page=${page}&zoom=${encodeURIComponent(
      zoom
    )}&view=${encodeURIComponent(view)}`;
    return parsed.toString();
  } catch {
    return `${url}#toolbar=${toolbar}&navpanes=${navpanes}&scrollbar=${scrollbar}&page=${page}&zoom=${encodeURIComponent(
      zoom
    )}&view=${encodeURIComponent(view)}`;
  }
}

const warmedPreviewUrls = new Set();
const warmedOrigins = new Set();

export function warmPreviewUrl(url) {
  if (typeof window === "undefined" || !isEmbeddableUrl(url)) {
    return;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    return;
  }

  const origin = parsedUrl.origin;

  if (!warmedOrigins.has(origin)) {
    warmedOrigins.add(origin);

    const preconnectLink = document.createElement("link");
    preconnectLink.rel = "preconnect";
    preconnectLink.href = origin;
    document.head.appendChild(preconnectLink);
  }

  if (warmedPreviewUrls.has(url)) {
    return;
  }

  warmedPreviewUrls.add(url);

  const prefetchLink = document.createElement("link");
  prefetchLink.rel = "prefetch";
  prefetchLink.href = url;
  document.head.appendChild(prefetchLink);

  window.fetch(url, {
    mode: "no-cors",
    cache: "force-cache"
  }).catch(() => {});
}

export function normalizePptItem(item = {}) {
  const pptAsset = item.file || item.pptFile || null;
  const previewAsset = item.previewFile || item.pdfPreviewFile || null;
  const pptUrl = normalizeAssetUrl(item.pptUrl || item.fileUrl || pptAsset?.secure_url, pptAsset);
  const inlinePptUrl = buildAssetProxyUrl(pptUrl);
  const proxiedPptUrl = buildAssetProxyUrl(pptUrl, { download: true });
  const previewPdfUrl = normalizeAssetUrl(
    item.previewPdfUrl || item.previewUrl || previewAsset?.secure_url,
    previewAsset
  );
  const proxiedPreviewPdfUrl = buildPdfProxyUrl(previewPdfUrl);
  const pdfViewerUrl = buildPdfViewerUrl(previewPdfUrl || proxiedPreviewPdfUrl, {
    toolbar: 1,
    navpanes: 0,
    scrollbar: 1,
    page: 1,
    zoom: "page-width",
    view: "FitH"
  });
  const officeViewerUrl = buildOfficeViewerUrl(inlinePptUrl || pptUrl);
  const googleViewerUrl = buildGoogleViewerUrl(inlinePptUrl || pptUrl);
  const modalPreviewUrl = pdfViewerUrl;
  const browserPreviewUrl = officeViewerUrl || googleViewerUrl || pdfViewerUrl || null;
  const previewIssue = !pptUrl
    ? "The PPT file URL is missing or invalid."
    : !browserPreviewUrl
      ? item.previewError || "Preview is not available yet for this presentation."
      : null;

  return {
    ...item,
    id: item.id || item._id,
    uploadedDate: item.uploadedDate || item.createdAt,
    file: pptAsset,
    previewFile: previewAsset,
    pptUrl,
    pptFileUrl: pptUrl,
    originalPptUrl: pptUrl,
    pptFileName: item.pptFileName || pptAsset?.original_filename || "",
    pptPublicId: item.pptPublicId || pptAsset?.public_id || null,
    previewPdfUrl,
    previewPublicId: item.previewPublicId || previewAsset?.public_id || null,
    pdfViewerUrl,
    browserPreviewUrl,
    googleViewerUrl,
    officeViewerUrl,
    modalPreviewUrl,
    previewIssue,
    downloadUrl: pptUrl ? proxiedPptUrl || pptUrl : null,
    fileUrl: pptUrl,
    previewUrl: proxiedPreviewPdfUrl || previewPdfUrl,
    journalTitle: item.journalTitle || item.journal?.managingJournalName || "",
    journalUrl: item.journalUrl || item.journal?.journalUrl || "",
    publicJournalUrl:
      item.publicJournalUrl ||
      item.journal?.publicJournalUrl ||
      getJournalRouteSlug(item.journalUrl || item.journal?.journalUrl || "")
  };
}

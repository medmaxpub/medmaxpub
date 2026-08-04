import api from "../api/client";
import { buildAssetProxyUrl } from "./assetProxy";
import { slugifyTitle } from "./journalLinks";

function stripHtmlText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toPdfFileName(title) {
  const clean = String(title || "document")
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\w\s.\-()']/g, "")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);

  return `${clean || "document"}.pdf`;
}

function getSiteBaseUrl() {
  // Strip the trailing /api so PDFs live at the site root
  return String(api.defaults.baseURL || "")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
}

/**
 * Generic PDF proxy URL (journal PDFs, previews, downloads).
 * The title goes in the URL PATH so the browser shows it instead of "pdf-proxy".
 *
 * @param {string} fileUrl            - Original Cloudinary PDF URL
 * @param {object} options
 * @param {boolean} options.download  - Adds ?download=1 to force a Save dialog
 * @param {string}  options.filename  - Title to use as the filename
 */
export function buildPdfProxyUrl(fileUrl, options = {}) {
  if (!fileUrl) return null;

  const baseUrl = String(api.defaults.baseURL || "").replace(/\/+$/, "");

  if (!baseUrl) {
    return buildAssetProxyUrl(fileUrl, options);
  }

  const proxyUrl = new URL(
    `${baseUrl}/assets/pdf/${encodeURIComponent(toPdfFileName(options.filename))}`
  );
  proxyUrl.searchParams.set("url", fileUrl);

  if (options.download) {
    proxyUrl.searchParams.set("download", "1");
  }

  return proxyUrl.toString();
}

/**
 * Clean .pdf URL for an article — opens in the browser's native PDF viewer
 * with the article title in the toolbar.
 *
 * e.g. https://medmaxpub.com/articles/interventional-rescue-of-failing-....pdf
 */
export function buildArticlePdfFileUrl(article) {
  const baseUrl = getSiteBaseUrl();
  if (!baseUrl) return null;

  const slug = slugifyTitle(stripHtmlText(article?.title));

  if (slug) {
    return `${baseUrl}/articles/${slug}.pdf`;
  }

  // No usable title — fall back to the id-based URL
  const articleId = article?.id || article?._id;
  return articleId ? `${baseUrl}/articles/${articleId}/pdf/article.pdf` : null;
}

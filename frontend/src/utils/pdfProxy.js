// import api from "../api/client";
// import { buildAssetProxyUrl } from "./assetProxy";

// export function buildPdfProxyUrl(fileUrl, options = {}) {
//   if (!fileUrl) {
//     return null;
//   }
//   const baseUrl = String(api.defaults.baseURL || "").replace(/\/+$/, "");

//   if (!baseUrl) {
//     return buildAssetProxyUrl(fileUrl, options);
//   }

//   const proxyUrl = new URL(`${baseUrl}/assets/pdf-proxy`);
//   proxyUrl.searchParams.set("url", fileUrl);

//   if (options.download) {
//     proxyUrl.searchParams.set("download", "1");
//   }

//   return proxyUrl.toString();
// }
import api from "../api/client";
import { buildAssetProxyUrl } from "./assetProxy";

/**
 * Builds the backend PDF proxy URL for a given Cloudinary (or other) PDF URL.
 *
 * @param {string} fileUrl   - The original Cloudinary PDF URL.
 * @param {object} options
 * @param {boolean} options.download  - If true, adds ?download=1 so the browser triggers a Save dialog.
 * @param {string}  options.filename  - ✅ The article/journal title to use as the downloaded filename.
 *                                       Pass the plain text title here (HTML will be stripped on the backend).
 */
export function buildPdfProxyUrl(fileUrl, options = {}) {
  if (!fileUrl) {
    return null;
  }

  const baseUrl = String(api.defaults.baseURL || "").replace(/\/+$/, "");

  if (!baseUrl) {
    return buildAssetProxyUrl(fileUrl, options);
  }

  const proxyUrl = new URL(`${baseUrl}/assets/pdf-proxy`);
  proxyUrl.searchParams.set("url", fileUrl);

  if (options.download) {
    proxyUrl.searchParams.set("download", "1");
  }

  // ✅ NEW: forward the article/journal title so the backend sets it as the filename
  if (options.filename) {
    proxyUrl.searchParams.set("filename", String(options.filename).trim());
  }

  return proxyUrl.toString();
}

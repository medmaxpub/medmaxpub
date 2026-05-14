import api from "../api/client";

export function buildPdfProxyUrl(fileUrl, options = {}) {
  if (!fileUrl) {
    return null;
  }

  const baseUrl = String(api.defaults.baseURL || "").replace(/\/+$/, "");

  if (!baseUrl) {
    return fileUrl;
  }

  const proxyUrl = new URL(`${baseUrl}/assets/pdf-proxy`);
  proxyUrl.searchParams.set("url", fileUrl);

  if (options.download) {
    proxyUrl.searchParams.set("download", "1");
  }

  return proxyUrl.toString();
}

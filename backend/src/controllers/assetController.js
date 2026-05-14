import path from "path";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
}

function getAllowedHosts(req) {
  const hosts = new Set(["res.cloudinary.com"]);

  try {
    hosts.add(new URL(`${req.protocol}://${req.get("host")}`).hostname);
  } catch {
    // Ignore malformed host values.
  }

  for (const candidate of [process.env.BACKEND_PUBLIC_URL, process.env.FRONTEND_URL, process.env.CLIENT_URL]) {
    if (!candidate) {
      continue;
    }

    try {
      hosts.add(new URL(candidate).hostname);
    } catch {
      // Ignore malformed env URLs.
    }
  }

  return hosts;
}

function isAllowedAssetTarget(targetUrl, req) {
  try {
    const parsed = new URL(targetUrl);
    const allowedHosts = getAllowedHosts(req);

    if (!(parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocalHostname(parsed.hostname)))) {
      return false;
    }

    if (allowedHosts.has(parsed.hostname)) {
      return parsed.pathname.includes("/upload") || parsed.pathname.includes("/uploads/");
    }

    return false;
  } catch {
    return false;
  }
}

function resolveFilename(targetUrl) {
  try {
    return path.basename(new URL(targetUrl).pathname) || "document.pdf";
  } catch {
    return "document.pdf";
  }
}

function resolveContentType(targetUrl, upstreamContentType = "") {
  const normalizedType = String(upstreamContentType || "").split(";")[0].trim().toLowerCase();

  if (normalizedType) {
    return normalizedType;
  }

  const lowerPath = String(targetUrl || "").toLowerCase();

  if (lowerPath.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (lowerPath.endsWith(".ppt")) {
    return "application/vnd.ms-powerpoint";
  }

  if (lowerPath.endsWith(".pptx")) {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }

  if (lowerPath.endsWith(".odp")) {
    return "application/vnd.oasis.opendocument.presentation";
  }

  return "application/octet-stream";
}

export const proxyPdfAsset = asyncHandler(async (req, res) => {
  const targetUrl = String(req.query.url || "").trim();
  const shouldDownload = String(req.query.download || "").trim() === "1";

  if (!targetUrl) {
    throw new AppError("PDF URL is required", 400);
  }

  if (!isAllowedAssetTarget(targetUrl, req)) {
    throw new AppError("PDF URL is not allowed", 400);
  }

  const response = await fetch(targetUrl, {
    redirect: "follow"
  });

  if (!response.ok) {
    throw new AppError(`Failed to load PDF asset (${response.status})`, 502);
  }

  const pdfBuffer = Buffer.from(await response.arrayBuffer());
  const filename = resolveFilename(targetUrl);

  console.info("[pdf-proxy] serve", {
    targetUrl,
    status: response.status,
    bytes: pdfBuffer.length,
    download: shouldDownload
  });

  res.set("Cache-Control", "no-store");
  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", `${shouldDownload ? "attachment" : "inline"}; filename="${filename}"`);
  res.send(pdfBuffer);
});

export const proxyFileAsset = asyncHandler(async (req, res) => {
  const targetUrl = String(req.query.url || "").trim();
  const shouldDownload = String(req.query.download || "").trim() === "1";

  if (!targetUrl) {
    throw new AppError("File URL is required", 400);
  }

  if (!isAllowedAssetTarget(targetUrl, req)) {
    throw new AppError("File URL is not allowed", 400);
  }

  const response = await fetch(targetUrl, {
    redirect: "follow"
  });

  if (!response.ok) {
    throw new AppError(`Failed to load file asset (${response.status})`, 502);
  }

  const fileBuffer = Buffer.from(await response.arrayBuffer());
  const filename = resolveFilename(targetUrl);
  const contentType = resolveContentType(targetUrl, response.headers.get("content-type"));

  console.info("[file-proxy] serve", {
    targetUrl,
    status: response.status,
    bytes: fileBuffer.length,
    contentType,
    download: shouldDownload
  });

  res.set("Cache-Control", "no-store");
  res.set("Content-Type", contentType);
  res.set("Content-Disposition", `${shouldDownload ? "attachment" : "inline"}; filename="${filename}"`);
  res.send(fileBuffer);
});

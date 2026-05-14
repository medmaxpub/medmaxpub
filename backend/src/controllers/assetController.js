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

function isAllowedPdfTarget(targetUrl, req) {
  try {
    const parsed = new URL(targetUrl);
    const allowedHosts = getAllowedHosts(req);

    if (!(parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocalHostname(parsed.hostname)))) {
      return false;
    }

    if (allowedHosts.has(parsed.hostname)) {
      return parsed.pathname.toLowerCase().endsWith(".pdf") || parsed.pathname.includes("/uploads/");
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

export const proxyPdfAsset = asyncHandler(async (req, res) => {
  const targetUrl = String(req.query.url || "").trim();
  const shouldDownload = String(req.query.download || "").trim() === "1";

  if (!targetUrl) {
    throw new AppError("PDF URL is required", 400);
  }

  if (!isAllowedPdfTarget(targetUrl, req)) {
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

// import path from "path";
// import cloudinary from "../config/cloudinary.js";
// import { AppError } from "../utils/appError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// function isLocalHostname(hostname) {
//   return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
// }

// function getAllowedHosts(req) {
//   const hosts = new Set(["res.cloudinary.com"]);

//   try {
//     hosts.add(new URL(`${req.protocol}://${req.get("host")}`).hostname);
//   } catch {
//     // Ignore malformed host values.
//   }

//   for (const candidate of [process.env.BACKEND_PUBLIC_URL, process.env.FRONTEND_URL, process.env.CLIENT_URL, process.env.CLOUDFRONT_URL]) {
//     if (!candidate) {
//       continue;
//     }

//     try {
//       hosts.add(new URL(candidate).hostname);
//     } catch {
//       // Ignore malformed env URLs.
//     }
//   }

//   return hosts;
// }

// function isAllowedAssetTarget(targetUrl, req) {
//   try {
//     const parsed = new URL(targetUrl);
//     const allowedHosts = getAllowedHosts(req);

//     if (!(parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocalHostname(parsed.hostname)))) {
//       return false;
//     }

//     if (allowedHosts.has(parsed.hostname)) {
//       return (
//         parsed.pathname.includes("/upload") ||
//         parsed.pathname.includes("/uploads/") ||
//         parsed.pathname.includes("/medmaxpub/") ||
//         parsed.pathname.includes("/ppt/") ||
//         parsed.pathname.includes("/pdf/") ||
//         parsed.pathname.includes("/images/") ||
//         parsed.pathname.includes("/videos/")
//       );
//     }

//     return false;
//   } catch {
//     return false;
//   }
// }

// function resolveFilename(targetUrl) {
//   try {
//     return path.basename(new URL(targetUrl).pathname) || "document.pdf";
//   } catch {
//     return "document.pdf";
//   }
// }

// // function resolveContentType(targetUrl, upstreamContentType = "") {
// //   const normalizedType = String(upstreamContentType || "").split(";")[0].trim().toLowerCase();

// //   if (normalizedType) {
// //     return normalizedType;
//   }

// //   const lowerPath = String(targetUrl || "").toLowerCase();

// //   if (lowerPath.endsWith(".pdf")) {
// //     return "application/pdf";
// //   }

// //   if (lowerPath.endsWith(".ppt")) {
// //     return "application/vnd.ms-powerpoint";
// //   }

// //   if (lowerPath.endsWith(".pptx")) {
// //     return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
// //   }

// //   if (lowerPath.endsWith(".odp")) {
// //     return "application/vnd.oasis.opendocument.presentation";
// //   }

// //   return "application/octet-stream";
// // }

// function parseCloudinaryAsset(targetUrl) {
//   try {
//     const parsed = new URL(targetUrl);

//     if (parsed.hostname !== "res.cloudinary.com") {
//       return null;
//     }

//     const segments = parsed.pathname.split("/").filter(Boolean);

//     if (segments.length < 5) {
//       return null;
//     }

//     const resourceType = segments[1];
//     const deliveryType = segments[2];
//     const versionIndex = segments.findIndex((segment, index) => index >= 3 && /^v\d+$/.test(segment));

//     if (versionIndex === -1 || versionIndex === segments.length - 1) {
//       return null;
//     }

//     const publicPath = segments.slice(versionIndex + 1).join("/");
//     const extension = path.extname(publicPath).replace(".", "").toLowerCase();
//     const publicId = extension ? publicPath.slice(0, -1 * (`.${extension}`).length) : publicPath;

//     if (!publicId) {
//       return null;
//     }

//     return {
//       publicId,
//       format: extension || undefined,
//       resourceType,
//       type: deliveryType
//     };
//   } catch {
//     return null;
//   }
// }

// function buildSignedCloudinaryDownloadUrl(targetUrl) {
//   const parsedAsset = parseCloudinaryAsset(targetUrl);

//   if (!parsedAsset?.publicId || !parsedAsset?.format) {
//     return null;
//   }

//   try {
//     return cloudinary.utils.private_download_url(parsedAsset.publicId, parsedAsset.format, {
//       resource_type: parsedAsset.resourceType,
//       type: parsedAsset.type,
//       expires_at: Math.floor(Date.now() / 1000) + 60 * 10
//     });
//   } catch {
//     return null;
//   }
// }

// async function fetchAssetWithCloudinaryFallback(targetUrl) {
//   let response = await fetch(targetUrl, {
//     redirect: "follow"
//   });

//   if (response.ok) {
//     return response;
//   }

//   if (response.status !== 401) {
//     return response;
//   }

//   const signedUrl = buildSignedCloudinaryDownloadUrl(targetUrl);

//   if (!signedUrl) {
//     return response;
//   }

//   response = await fetch(signedUrl, {
//     redirect: "follow"
//   });

//   return response;
// }

// export const proxyPdfAsset = asyncHandler(async (req, res) => {
//   const targetUrl = String(req.query.url || "").trim();
//   const shouldDownload = String(req.query.download || "").trim() === "1";

//   if (!targetUrl) {
//     throw new AppError("PDF URL is required", 400);
//   }

//   if (!isAllowedAssetTarget(targetUrl, req)) {
//     throw new AppError("PDF URL is not allowed", 400);
//   }

//   const response = await fetchAssetWithCloudinaryFallback(targetUrl);

//   if (!response.ok) {
//     throw new AppError(`Failed to load PDF asset (${response.status})`, 502);
//   }

//   const pdfBuffer = Buffer.from(await response.arrayBuffer());
//   const filename = resolveFilename(targetUrl);

//   console.info("[pdf-proxy] serve", {
//     targetUrl,
//     status: response.status,
//     bytes: pdfBuffer.length,
//     download: shouldDownload
//   });

//   res.set("Cache-Control", "no-store");
//   res.set("Content-Type", "application/pdf");
//   res.set("Content-Disposition", `${shouldDownload ? "attachment" : "inline"}; filename="${filename}"`);
//   res.send(pdfBuffer);
// });

// export const proxyFileAsset = asyncHandler(async (req, res) => {
//   const targetUrl = String(req.query.url || "").trim();
//   const shouldDownload = String(req.query.download || "").trim() === "1";

//   if (!targetUrl) {
//     throw new AppError("File URL is required", 400);
//   }

//   if (!isAllowedAssetTarget(targetUrl, req)) {
//     throw new AppError("File URL is not allowed", 400);
//   }

//   const response = await fetchAssetWithCloudinaryFallback(targetUrl);

//   if (!response.ok) {
//     throw new AppError(`Failed to load file asset (${response.status})`, 502);
//   }

//   const fileBuffer = Buffer.from(await response.arrayBuffer());
//   const filename = resolveFilename(targetUrl);
//   const contentType = resolveContentType(targetUrl, response.headers.get("content-type"));

//   console.info("[file-proxy] serve", {
//     targetUrl,
//     status: response.status,
//     bytes: fileBuffer.length,
//     contentType,
//     download: shouldDownload
//   });

//   res.set("Cache-Control", "no-store");
//   res.set("Content-Type", contentType);
//   res.set("Content-Disposition", `${shouldDownload ? "attachment" : "inline"}; filename="${filename}"`);
//   res.send(fileBuffer);
// });
import path from "path";
import cloudinary from "../config/cloudinary.js";
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

  for (const candidate of [process.env.BACKEND_PUBLIC_URL, process.env.FRONTEND_URL, process.env.CLIENT_URL, process.env.CLOUDFRONT_URL]) {
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
      return (
        parsed.pathname.includes("/upload") ||
        parsed.pathname.includes("/uploads/") ||
        parsed.pathname.includes("/medmaxpub/") ||
        parsed.pathname.includes("/ppt/") ||
        parsed.pathname.includes("/pdf/") ||
        parsed.pathname.includes("/images/") ||
        parsed.pathname.includes("/videos/")
      );
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

// ✅ NEW: sanitize and build a safe filename from the article/journal title
function buildSafeFilename(customFilename, fallbackUrl, extension = "pdf") {
  const raw = String(customFilename || "").trim();

  if (raw) {
    const sanitized = raw
      .replace(/<[^>]*>/g, " ")          // strip any HTML tags
      .replace(/[^\w\s.\-()']/g, "")     // keep word chars, spaces, common punctuation
      .replace(/\s+/g, "_")              // spaces → underscores
      .replace(/_{2,}/g, "_")            // collapse multiple underscores
      .replace(/^_+|_+$/g, "")          // trim leading/trailing underscores
      .slice(0, 180);                    // cap length

    if (sanitized) {
      return sanitized.toLowerCase().endsWith(`.${extension}`)
        ? sanitized
        : `${sanitized}.${extension}`;
    }
  }

  // Fall back to the filename derived from the original URL
  return resolveFilename(fallbackUrl);
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

function parseCloudinaryAsset(targetUrl) {
  try {
    const parsed = new URL(targetUrl);

    if (parsed.hostname !== "res.cloudinary.com") {
      return null;
    }

    const segments = parsed.pathname.split("/").filter(Boolean);

    if (segments.length < 5) {
      return null;
    }

    const resourceType = segments[1];
    const deliveryType = segments[2];
    const versionIndex = segments.findIndex((segment, index) => index >= 3 && /^v\d+$/.test(segment));

    if (versionIndex === -1 || versionIndex === segments.length - 1) {
      return null;
    }

    const publicPath = segments.slice(versionIndex + 1).join("/");
    const extension = path.extname(publicPath).replace(".", "").toLowerCase();
    const publicId = extension ? publicPath.slice(0, -1 * (`.${extension}`).length) : publicPath;

    if (!publicId) {
      return null;
    }

    return {
      publicId,
      format: extension || undefined,
      resourceType,
      type: deliveryType
    };
  } catch {
    return null;
  }
}

function buildSignedCloudinaryDownloadUrl(targetUrl) {
  const parsedAsset = parseCloudinaryAsset(targetUrl);

  if (!parsedAsset?.publicId || !parsedAsset?.format) {
    return null;
  }

  try {
    return cloudinary.utils.private_download_url(parsedAsset.publicId, parsedAsset.format, {
      resource_type: parsedAsset.resourceType,
      type: parsedAsset.type,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 10
    });
  } catch {
    return null;
  }
}

async function fetchAssetWithCloudinaryFallback(targetUrl) {
  let response = await fetch(targetUrl, {
    redirect: "follow"
  });

  if (response.ok) {
    return response;
  }

  if (response.status !== 401) {
    return response;
  }

  const signedUrl = buildSignedCloudinaryDownloadUrl(targetUrl);

  if (!signedUrl) {
    return response;
  }

  response = await fetch(signedUrl, {
    redirect: "follow"
  });

  return response;
}

export const proxyPdfAsset = asyncHandler(async (req, res) => {
  const targetUrl = String(req.query.url || "").trim();
  const shouldDownload = String(req.query.download || "").trim() === "1";
  // ✅ NEW: accept the article/journal title as the desired filename
  const customFilename = String(req.query.filename || "").trim();

  if (!targetUrl) {
    throw new AppError("PDF URL is required", 400);
  }

  if (!isAllowedAssetTarget(targetUrl, req)) {
    throw new AppError("PDF URL is not allowed", 400);
  }

  const response = await fetchAssetWithCloudinaryFallback(targetUrl);

  if (!response.ok) {
    throw new AppError(`Failed to load PDF asset (${response.status})`, 502);
  }

  const pdfBuffer = Buffer.from(await response.arrayBuffer());

  // ✅ Use article title as filename if provided, otherwise fall back to URL-derived name
  const filename = buildSafeFilename(customFilename, targetUrl, "pdf");

  console.info("[pdf-proxy] serve", {
    targetUrl,
    status: response.status,
    bytes: pdfBuffer.length,
    filename,
    download: shouldDownload
  });

  res.set("Cache-Control", "no-store");
  res.set("Content-Type", "application/pdf");
  // ✅ Content-Disposition now uses the article title as the filename
  res.set("Content-Disposition", `${shouldDownload ? "attachment" : "inline"}; filename="${filename}"`);
  res.send(pdfBuffer);
});

export const proxyFileAsset = asyncHandler(async (req, res) => {
  const targetUrl = String(req.query.url || "").trim();
  const shouldDownload = String(req.query.download || "").trim() === "1";
  // ✅ NEW: accept a custom filename here too for consistency
  const customFilename = String(req.query.filename || "").trim();

  if (!targetUrl) {
    throw new AppError("File URL is required", 400);
  }

  if (!isAllowedAssetTarget(targetUrl, req)) {
    throw new AppError("File URL is not allowed", 400);
  }

  const response = await fetchAssetWithCloudinaryFallback(targetUrl);

  if (!response.ok) {
    throw new AppError(`Failed to load file asset (${response.status})`, 502);
  }

  const fileBuffer = Buffer.from(await response.arrayBuffer());
  const contentType = resolveContentType(targetUrl, response.headers.get("content-type"));

  // ✅ Detect extension from content type or URL
  const extMap = {
    "application/pdf": "pdf",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.oasis.opendocument.presentation": "odp"
  };
  const ext = extMap[contentType] || path.extname(targetUrl).replace(".", "") || "bin";
  const filename = buildSafeFilename(customFilename, targetUrl, ext);

  console.info("[file-proxy] serve", {
    targetUrl,
    status: response.status,
    bytes: fileBuffer.length,
    contentType,
    filename,
    download: shouldDownload
  });

  res.set("Cache-Control", "no-store");
  res.set("Content-Type", contentType);
  // ✅ Content-Disposition now uses the title as the filename
  res.set("Content-Disposition", `${shouldDownload ? "attachment" : "inline"}; filename="${filename}"`);
  res.send(fileBuffer);
});

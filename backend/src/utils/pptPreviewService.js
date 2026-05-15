import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import { execFile } from "child_process";
import { resolveStoredAssetPath, uploadAsset } from "./assetStorage.js";
import cloudinary from "../config/cloudinary.js";
import { hasCloudinaryConfig } from "./cloudinaryService.js";

const execFileAsync = promisify(execFile);
const LIBREOFFICE_COMMANDS = ["libreoffice", "soffice"];

const PPT_MIME_TYPES = new Set([
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.presentation"
]);

const PPT_EXTENSIONS = new Set([".ppt", ".pptx", ".odp"]);
const CLOUNDINARY_PREVIEW_WAIT_ATTEMPTS = 6;
const CLOUNDINARY_PREVIEW_WAIT_MS = 1500;

function hasConvertiblePptExtension(filename = "") {
  return PPT_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function isConvertiblePptFile(file) {
  return Boolean(file && (PPT_MIME_TYPES.has(file.mimetype) || hasConvertiblePptExtension(file.originalname)));
}

async function convertPresentationToPdf(inputPath, outputDirectory) {
  let lastError = null;

  for (const command of LIBREOFFICE_COMMANDS) {
    try {
      await execFileAsync(command, [
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        outputDirectory,
        inputPath
      ]);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  const outputFilename = `${path.basename(inputPath, path.extname(inputPath))}.pdf`;
  return path.join(outputDirectory, outputFilename);
}

async function buildPdfAssetFromPath(pdfPath, baseName, req) {
  const pdfBuffer = await fs.readFile(pdfPath);

  return uploadAsset(
    {
      buffer: pdfBuffer,
      originalname: `${baseName}.pdf`,
      mimetype: "application/pdf",
      size: pdfBuffer.length
    },
    "medmaxpub/ppts-previews",
    "image",
    req
  );
}

function isCloudinaryAsset(asset) {
  return asset?.storage === "cloudinary" || asset?.secure_url?.includes("res.cloudinary.com");
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function generatePreviewAssetFromUpload(file, req) {
  if (!isConvertiblePptFile(file)) {
    return null;
  }

  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "medmaxpub-ppt-preview-"));
  const sourceFilename = file.originalname || "presentation.pptx";
  const sourcePath = path.join(tempDirectory, sourceFilename);

  try {
    await fs.writeFile(sourcePath, file.buffer);
    const pdfPath = await convertPresentationToPdf(sourcePath, tempDirectory);
    return buildPdfAssetFromPath(pdfPath, path.basename(sourceFilename, path.extname(sourceFilename)), req);
  } catch (error) {
    return null;
  } finally {
    await fs.rm(tempDirectory, { recursive: true, force: true });
  }
}

function resolveAssetFilename(asset) {
  const candidates = [asset?.original_filename, asset?.public_id, asset?.secure_url];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      if (candidate.startsWith?.("http")) {
        const pathname = new URL(candidate).pathname;
        const name = path.basename(pathname);

        if (hasConvertiblePptExtension(name)) {
          return name;
        }

        continue;
      }

      const name = path.basename(candidate);

      if (hasConvertiblePptExtension(name)) {
        return name;
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function downloadRemoteAsset(asset, targetPath) {
  if (!asset?.secure_url) {
    return false;
  }

  const response = await fetch(asset.secure_url, { redirect: "follow" });

  if (!response.ok) {
    throw new Error(`Unable to download PPT asset: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(targetPath, Buffer.from(arrayBuffer));
  return true;
}

function buildCloudinaryPreviewUrl(asset) {
  if (!asset?.secure_url || !isCloudinaryAsset(asset)) {
    return null;
  }

  try {
    const parsed = new URL(asset.secure_url);
    parsed.pathname = parsed.pathname.replace("/raw/upload/", "/image/upload/");

    if (!parsed.pathname.toLowerCase().endsWith(".pdf")) {
      parsed.pathname = `${parsed.pathname}.pdf`;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function buildCloudinaryPreviewAsset(asset, previewUrl, sourceFilename) {
  if (!previewUrl) {
    return null;
  }

  return {
    storage: "cloudinary",
    public_id: asset.public_id,
    secure_url: previewUrl,
    resource_type: "image",
    format: "pdf",
    file_type: "application/pdf",
    original_filename: `${sourceFilename}.pdf`,
    size: null,
    uploaded_at: new Date().toISOString()
  };
}

async function requestCloudinaryAsposeConversion(asset) {
  if (!hasCloudinaryConfig() || !asset?.public_id) {
    return { ok: false, reason: "Cloudinary is not configured for PPT preview conversion." };
  }

  try {
    await cloudinary.uploader.explicit(asset.public_id, {
      resource_type: "raw",
      type: "upload",
      raw_convert: "aspose"
    });
    return { ok: true, reason: "" };
  } catch (error) {
    return {
      ok: false,
      reason: error?.message || "Cloudinary PPT preview conversion is unavailable."
    };
  }
}

async function waitForCloudinaryPreview(asset, sourceFilename) {
  const previewUrl = buildCloudinaryPreviewUrl(asset);

  if (!previewUrl) {
    return null;
  }

  for (let attempt = 0; attempt < CLOUNDINARY_PREVIEW_WAIT_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(previewUrl, {
        method: "HEAD",
        redirect: "follow"
      });

      if (response.ok) {
        return buildCloudinaryPreviewAsset(asset, previewUrl, sourceFilename);
      }
    } catch {
      // Keep polling briefly while Aspose finishes the conversion.
    }

    await delay(CLOUNDINARY_PREVIEW_WAIT_MS);
  }

  return null;
}

export async function generatePreviewAssetFromStoredFile(asset, req) {
  const sourceFilename = resolveAssetFilename(asset);

  if (!asset?.public_id || !sourceFilename) {
    return null;
  }

  if (isCloudinaryAsset(asset)) {
    const conversionRequest = await requestCloudinaryAsposeConversion(asset);

    if (!conversionRequest.ok) {
      return null;
    }

    return waitForCloudinaryPreview(asset, sourceFilename);
  }

  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "medmaxpub-ppt-preview-backfill-"));
  const tempSourcePath = path.join(tempDirectory, sourceFilename);

  try {
    try {
      const sourcePath = resolveStoredAssetPath(asset);
      const sourceBuffer = await fs.readFile(sourcePath);
      await fs.writeFile(tempSourcePath, sourceBuffer);
    } catch {
      const downloaded = await downloadRemoteAsset(asset, tempSourcePath);

      if (!downloaded) {
        return null;
      }
    }

    const pdfPath = await convertPresentationToPdf(tempSourcePath, tempDirectory);
    return buildPdfAssetFromPath(
      pdfPath,
      path.basename(sourceFilename, path.extname(sourceFilename)),
      req
    );
  } catch (error) {
    return null;
  } finally {
    await fs.rm(tempDirectory, { recursive: true, force: true });
  }
}

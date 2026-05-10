import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import { execFile } from "child_process";
import { resolveStoredAssetPath, uploadAsset } from "./assetStorage.js";

const execFileAsync = promisify(execFile);

const PPT_MIME_TYPES = new Set([
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.presentation"
]);

const PPT_EXTENSIONS = new Set([".ppt", ".pptx", ".odp"]);

function hasConvertiblePptExtension(filename = "") {
  return PPT_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function isConvertiblePptFile(file) {
  return Boolean(file && (PPT_MIME_TYPES.has(file.mimetype) || hasConvertiblePptExtension(file.originalname)));
}

async function convertPresentationToPdf(inputPath, outputDirectory) {
  await execFileAsync("libreoffice", [
    "--headless",
    "--convert-to",
    "pdf",
    "--outdir",
    outputDirectory,
    inputPath
  ]);

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
    "raw",
    req
  );
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

export async function generatePreviewAssetFromStoredFile(asset, req) {
  if (!asset?.public_id || !hasConvertiblePptExtension(asset.original_filename || asset.public_id)) {
    return null;
  }

  let sourcePath;

  try {
    sourcePath = resolveStoredAssetPath(asset);
  } catch (error) {
    return null;
  }

  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "medmaxpub-ppt-preview-backfill-"));
  const tempSourcePath = path.join(tempDirectory, asset.original_filename || path.basename(sourcePath));

  try {
    const sourceBuffer = await fs.readFile(sourcePath);
    await fs.writeFile(tempSourcePath, sourceBuffer);
    const pdfPath = await convertPresentationToPdf(tempSourcePath, tempDirectory);
    return buildPdfAssetFromPath(
      pdfPath,
      path.basename(asset.original_filename || path.basename(sourcePath), path.extname(asset.original_filename || path.basename(sourcePath))),
      req
    );
  } catch (error) {
    return null;
  } finally {
    await fs.rm(tempDirectory, { recursive: true, force: true });
  }
}

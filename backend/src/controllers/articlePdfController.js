import { PDFDocument } from "pdf-lib";
import Article from "../models/Article.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyTitle(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Turns "interventional-rescue-of-failing" into a regex that matches the
 * original title, whatever punctuation or spacing it used:
 *   /interventional[^a-zA-Z0-9]+rescue[^a-zA-Z0-9]+of[^a-zA-Z0-9]+failing/i
 */
function slugToTitleRegex(slug) {
  const words = String(slug || "")
    .split("-")
    .filter(Boolean)
    .map(escapeRegex);

  if (!words.length) return null;

  return new RegExp(words.join("[^a-zA-Z0-9]+"), "i");
}

/**
 * Fetches the source PDF, writes the article title into its metadata
 * (that string is what the browser's PDF viewer shows in its toolbar),
 * and sends it inline.
 */
async function sendArticlePdf(article, res) {
  const sourceUrl = article.pdfFile?.secure_url;

  if (!sourceUrl) {
    throw new AppError("This article has no PDF attached", 404);
  }

  const title = stripHtml(article.title) || "Article";

  const response = await fetch(sourceUrl, { redirect: "follow" });

  if (!response.ok) {
    throw new AppError(`Failed to load PDF asset (${response.status})`, 502);
  }

  let pdfBuffer = Buffer.from(await response.arrayBuffer());

  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      updateMetadata: false,
      ignoreEncryption: true
    });

    pdfDoc.setTitle(title);
    pdfDoc.setSubject(title);

    pdfBuffer = Buffer.from(await pdfDoc.save({ useObjectStreams: false }));
  } catch (error) {
    // Encrypted or malformed PDF — serve the original file untouched.
    console.warn("[article-pdf] metadata not applied:", error.message);
  }

  const filename = `${slugifyTitle(title) || "article"}.pdf`;

  console.info("[article-pdf] serve", {
    articleId: String(article._id),
    bytes: pdfBuffer.length,
    filename
  });

  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", `inline; filename="${filename}"`);
  res.set("Cache-Control", "public, max-age=3600");
  res.send(pdfBuffer);
}

/**
 * GET /articles/<article-title-slug>.pdf
 *
 * Clean public URL — no database id. The slug is matched back against the
 * article title.
 */
export const serveArticlePdfBySlug = asyncHandler(async (req, res) => {
  const slug = String(req.params.filename || "").replace(/\.pdf$/i, "");
  const titleRegex = slugToTitleRegex(slug);

  if (!titleRegex) {
    throw new AppError("Article not found", 404);
  }

  const article = await Article.findOne({
    title: { $regex: titleRegex },
    "pdfFile.secure_url": { $exists: true, $ne: "" }
  }).select("title pdfFile");

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  await sendArticlePdf(article, res);
});

/**
 * GET /articles/:id/pdf/:slug
 *
 * Kept for backwards compatibility with links that already carry the id.
 */
export const serveArticlePdf = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id).select("title pdfFile");

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  await sendArticlePdf(article, res);
});

import Article from "../models/Article.js";
import { ensureJournalAccess } from "../utils/accessControl.js";
import { uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createArticle = asyncHandler(async (req, res) => {
  ensureJournalAccess(req.user, req.body.journalId);

  const pdfFile = await uploadAsset(req.file, "medmaxpub/articles", "raw", req);
  const article = await Article.create({
    journal: req.body.journalId,
    issue: req.body.issueId,
    title: req.body.title,
    authors: (req.body.authors || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    articleType: req.body.articleType || "",
    abstractText: req.body.abstractText || "",
    inPress: req.body.inPress === "true" || req.body.inPress === true,
    pdfFile
  });

  res.status(201).json(article);
});

export const getArticlesByIssue = asyncHandler(async (req, res) => {
  const articles = await Article.find({ issue: req.params.id }).sort({ createdAt: -1 }).lean();
  res.json(
    articles.map((article) => ({
      id: article._id,
      title: article.title,
      authors: article.authors,
      pdfUrl: article.pdfFile?.secure_url || null
    }))
  );
});

export const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  res.json(article);
});

import Article from "../models/Article.js";
import Issue from "../models/Issue.js";
import Journal from "../models/Journal.js";
import { buildAccessibleJournalFilter, ensureJournalAccess } from "../utils/accessControl.js";
import { deleteAsset, uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const ARTICLE_STATUSES = {
  IN_PRESS: "IN_PRESS",
  CURRENT_ISSUE: "CURRENT_ISSUE",
  ARCHIVED: "ARCHIVED"
};

const ARTICLE_STATUS_VALUES = Object.values(ARTICLE_STATUSES);
const INDEXING_LINK_FIELDS = [
  "googleScholar",
  "researchGate",
  "pubMed",
  "worldCat",
  "scilit",
  "drji",
  "baiduScholar",
  "academia",
  "microsoftAcademic"
];

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOptionalDate(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ");
}

export function deriveArticleStatus(article) {
  if (ARTICLE_STATUS_VALUES.includes(article?.status)) {
    return article.status;
  }

  return article?.inPress ? ARTICLE_STATUSES.IN_PRESS : ARTICLE_STATUSES.CURRENT_ISSUE;
}

function splitAuthors(authorNames) {
  return stripHtml(authorNames)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeIndexingLinks(body = {}) {
  return INDEXING_LINK_FIELDS.reduce(
    (links, field) => ({
      ...links,
      [field]: normalizeText(body[field])
    }),
    {}
  );
}

function buildArticlePayload(body = {}) {
  return {
    accessType: normalizeText(body.accessType),
    volume: normalizeOptionalNumber(body.volume),
    issueNumber: normalizeOptionalNumber(body.issueNumber),
    releaseMonth: normalizeText(body.releaseMonth),
    releaseYear: normalizeOptionalNumber(body.releaseYear),
    specialIssueTitle: normalizeText(body.specialIssueTitle),
    articleType: normalizeText(body.articleType),
    title: normalizeText(body.title),
    authorNames: normalizeText(body.authorNames),
    correspondingAuthorEmail: normalizeText(body.correspondingAuthorEmail).toLowerCase(),
    citeAs: normalizeText(body.citeAs),
    keywords: normalizeText(body.keywords),
    firstPageNumber: normalizeOptionalNumber(body.firstPageNumber),
    lastPageNumber: normalizeOptionalNumber(body.lastPageNumber),
    abstractText: normalizeText(body.abstractText),
    country: normalizeText(body.country),
    publishedDate: normalizeOptionalDate(body.publishedDate),
    doiNumber: normalizeText(body.doiNumber),
    status: normalizeText(body.status).toUpperCase() || ARTICLE_STATUSES.IN_PRESS,
    indexingLinks: normalizeIndexingLinks(body)
  };
}

function validateArticlePayload(payload) {
  const requiredFields = {
    accessType: "Article access type",
    volume: "Volume number",
    issueNumber: "Issue number",
    releaseMonth: "Issue releasing month",
    releaseYear: "Issue releasing year",
    title: "Article title",
    authorNames: "Author names",
    correspondingAuthorEmail: "Corresponding author's email",
    citeAs: "Cite this article as",
    keywords: "Keywords",
    firstPageNumber: "First page number",
    lastPageNumber: "Last page number",
    abstractText: "Abstract",
    country: "Country",
    publishedDate: "Article published date"
  };

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!payload[field]) {
      throw new AppError(`${label} is required`, 400);
    }
  }

  if (!ARTICLE_STATUS_VALUES.includes(payload.status)) {
    throw new AppError("Invalid article status", 400);
  }
}

async function resolveJournalId(req) {
  const explicitJournalId = normalizeText(req.body.journalId);

  if (explicitJournalId) {
    return explicitJournalId;
  }

  const ownedJournal = await Journal.findOne({ owner: req.user._id }).select("_id").lean();

  if (!ownedJournal) {
    throw new AppError("No journal is assigned to this user", 400);
  }

  return ownedJournal._id.toString();
}

async function resolveIssueForArticle(journalId, payload) {
  if (!payload.volume || !payload.issueNumber || !payload.releaseYear) {
    return null;
  }

  const existingIssue = await Issue.findOne({
    journal: journalId,
    volume: payload.volume,
    issue: payload.issueNumber,
    year: payload.releaseYear
  });

  if (existingIssue) {
    if (payload.releaseMonth && payload.releaseMonth !== existingIssue.month) {
      existingIssue.month = payload.releaseMonth;
      await existingIssue.save();
    }

    return existingIssue;
  }

  return Issue.create({
    journal: journalId,
    volume: payload.volume,
    issue: payload.issueNumber,
    month: payload.releaseMonth,
    year: payload.releaseYear,
    isCurrent: false
  });
}

async function syncJournalIssueFlags(journalId) {
  const articles = await Article.find({ journal: journalId })
    .select("issue status inPress publishedDate updatedAt")
    .sort({ publishedDate: -1, updatedAt: -1, createdAt: -1 })
    .lean();

  const currentArticle = articles.find(
    (article) => deriveArticleStatus(article) === ARTICLE_STATUSES.CURRENT_ISSUE && article.issue
  );

  await Issue.updateMany({ journal: journalId }, { $set: { isCurrent: false } });

  if (currentArticle?.issue) {
    await Issue.updateOne({ _id: currentArticle.issue }, { $set: { isCurrent: true } });
  }
}

function serializeArticle(article) {
  const journal = article.journal && typeof article.journal === "object" ? article.journal : null;
  const issue = article.issue && typeof article.issue === "object" ? article.issue : null;

  return {
    id: article._id,
    journalId: journal?._id || article.journal || null,
    managingJournalName: journal?.managingJournalName || "",
    journalUrl: journal?.journalUrl || "",
    issueId: issue?._id || article.issue || null,
    accessType: article.accessType || "",
    volume: article.volume ?? issue?.volume ?? null,
    issueNumber: article.issueNumber ?? issue?.issue ?? null,
    releaseMonth: article.releaseMonth || issue?.month || "",
    releaseYear: article.releaseYear ?? issue?.year ?? null,
    specialIssueTitle: article.specialIssueTitle || "",
    articleType: article.articleType || "",
    title: article.title || "",
    authorNames: article.authorNames || article.authors?.join(", ") || "",
    authors: article.authors || [],
    correspondingAuthorEmail: article.correspondingAuthorEmail || "",
    citeAs: article.citeAs || "",
    keywords: article.keywords || "",
    firstPageNumber: article.firstPageNumber ?? null,
    lastPageNumber: article.lastPageNumber ?? null,
    abstractText: article.abstractText || "",
    country: article.country || "",
    publishedDate: article.publishedDate || null,
    doiNumber: article.doiNumber || "",
    status: deriveArticleStatus(article),
    indexingLinks: {
      googleScholar: article.indexingLinks?.googleScholar || "",
      researchGate: article.indexingLinks?.researchGate || "",
      pubMed: article.indexingLinks?.pubMed || "",
      worldCat: article.indexingLinks?.worldCat || "",
      scilit: article.indexingLinks?.scilit || "",
      drji: article.indexingLinks?.drji || "",
      baiduScholar: article.indexingLinks?.baiduScholar || "",
      academia: article.indexingLinks?.academia || "",
      microsoftAcademic: article.indexingLinks?.microsoftAcademic || ""
    },
    pdfFileUrl: article.pdfFile?.secure_url || null,
    pdfFile: article.pdfFile || null,
    supplementaryFiles: (article.supplementaryFiles || []).map((file, index) => ({
      id: `${article._id}-supp-${index}`,
      name: file.original_filename || `Supplementary File ${index + 1}`,
      url: file.secure_url || null,
      asset: file
    })),
    createdAt: article.createdAt,
    updatedAt: article.updatedAt
  };
}

async function uploadSupplementaryAssets(files, req) {
  if (!files?.length) {
    return [];
  }

  return Promise.all(files.map((file) => uploadAsset(file, "medmaxpub/articles/supplementary", "raw", req)));
}

async function replaceArticleAssets(article, files, req) {
  const nextPdfUpload = files?.pdfFile?.[0] || null;
  const nextSupplementaryUploads = files?.supplementaryFiles || [];

  if (nextPdfUpload) {
    await deleteAsset(article.pdfFile, "image");
    article.pdfFile = await uploadAsset(nextPdfUpload, "medmaxpub/articles", "image", req);
  }

  if (nextSupplementaryUploads.length) {
    await Promise.all((article.supplementaryFiles || []).map((asset) => deleteAsset(asset, "raw")));
    article.supplementaryFiles = await uploadSupplementaryAssets(nextSupplementaryUploads, req);
  }
}

async function findAccessibleArticle(user, articleId) {
  const article = await Article.findById(articleId);

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  await ensureJournalAccess(user, article.journal);
  return article;
}

export const createArticle = asyncHandler(async (req, res) => {
  const payload = buildArticlePayload(req.body);
  validateArticlePayload(payload);

  const journalId = await resolveJournalId(req);
  await ensureJournalAccess(req.user, journalId);

  const issue = await resolveIssueForArticle(journalId, payload);
  const pdfFile = await uploadAsset(req.files?.pdfFile?.[0], "medmaxpub/articles", "image", req);
  const supplementaryFiles = await uploadSupplementaryAssets(req.files?.supplementaryFiles, req);

  const article = await Article.create({
    journal: journalId,
    issue: issue?._id || null,
    title: payload.title,
    authors: splitAuthors(payload.authorNames),
    authorNames: payload.authorNames,
    articleType: payload.articleType,
    accessType: payload.accessType,
    volume: payload.volume,
    issueNumber: payload.issueNumber,
    releaseMonth: payload.releaseMonth,
    releaseYear: payload.releaseYear,
    specialIssueTitle: payload.specialIssueTitle,
    correspondingAuthorEmail: payload.correspondingAuthorEmail,
    citeAs: payload.citeAs,
    keywords: payload.keywords,
    firstPageNumber: payload.firstPageNumber,
    lastPageNumber: payload.lastPageNumber,
    abstractText: payload.abstractText,
    country: payload.country,
    publishedDate: payload.publishedDate,
    doiNumber: payload.doiNumber,
    indexingLinks: payload.indexingLinks,
    status: payload.status,
    inPress: payload.status === ARTICLE_STATUSES.IN_PRESS,
    pdfFile,
    supplementaryFiles
  });

  await syncJournalIssueFlags(journalId);
  const populatedArticle = await Article.findById(article._id).populate("journal", "managingJournalName journalUrl").populate("issue");
  res.status(201).json(serializeArticle(populatedArticle));
});

export const updateArticle = asyncHandler(async (req, res) => {
  const article = await findAccessibleArticle(req.user, req.params.id);
  const payload = buildArticlePayload(req.body);
  validateArticlePayload(payload);

  const issue = await resolveIssueForArticle(article.journal, payload);
  await replaceArticleAssets(article, req.files, req);

  article.issue = issue?._id || article.issue || null;
  article.title = payload.title;
  article.authors = splitAuthors(payload.authorNames);
  article.authorNames = payload.authorNames;
  article.articleType = payload.articleType;
  article.accessType = payload.accessType;
  article.volume = payload.volume;
  article.issueNumber = payload.issueNumber;
  article.releaseMonth = payload.releaseMonth;
  article.releaseYear = payload.releaseYear;
  article.specialIssueTitle = payload.specialIssueTitle;
  article.correspondingAuthorEmail = payload.correspondingAuthorEmail;
  article.citeAs = payload.citeAs;
  article.keywords = payload.keywords;
  article.firstPageNumber = payload.firstPageNumber;
  article.lastPageNumber = payload.lastPageNumber;
  article.abstractText = payload.abstractText;
  article.country = payload.country;
  article.publishedDate = payload.publishedDate;
  article.doiNumber = payload.doiNumber;
  article.indexingLinks = payload.indexingLinks;
  article.status = payload.status;
  article.inPress = payload.status === ARTICLE_STATUSES.IN_PRESS;
  await article.save();

  await syncJournalIssueFlags(article.journal);
  const populatedArticle = await Article.findById(article._id).populate("journal", "managingJournalName journalUrl").populate("issue");
  res.json(serializeArticle(populatedArticle));
});

export const updateArticleStatus = asyncHandler(async (req, res) => {
  const article = await findAccessibleArticle(req.user, req.params.id);
  const nextStatus = normalizeText(req.body.status).toUpperCase();

  if (!ARTICLE_STATUS_VALUES.includes(nextStatus)) {
    throw new AppError("Invalid target status", 400);
  }

  if (!article.issue && article.volume && article.issueNumber && article.releaseYear) {
    const issue = await resolveIssueForArticle(article.journal, {
      volume: article.volume,
      issueNumber: article.issueNumber,
      releaseMonth: article.releaseMonth,
      releaseYear: article.releaseYear
    });
    article.issue = issue?._id || null;
  }

  article.status = nextStatus;
  article.inPress = nextStatus === ARTICLE_STATUSES.IN_PRESS;
  await article.save();

  await syncJournalIssueFlags(article.journal);
  const populatedArticle = await Article.findById(article._id).populate("journal", "managingJournalName journalUrl").populate("issue");
  res.json(serializeArticle(populatedArticle));
});

export const deleteArticle = asyncHandler(async (req, res) => {
  const article = await findAccessibleArticle(req.user, req.params.id);
  const journalId = article.journal;

  await deleteAsset(article.pdfFile, "raw");
  await Promise.all((article.supplementaryFiles || []).map((asset) => deleteAsset(asset, "raw")));
  await article.deleteOne();
  await syncJournalIssueFlags(journalId);

  res.status(204).send();
});

export const getUserArticles = asyncHandler(async (req, res) => {
  const status = normalizeText(req.query.status).toUpperCase();
  const search = normalizeText(req.query.search).toLowerCase();
  const requestedJournalId = normalizeText(req.query.journalId);
  const filter = {
    ...buildAccessibleJournalFilter(req.user)
  };

  if (requestedJournalId) {
    await ensureJournalAccess(req.user, requestedJournalId);
    filter.journal = requestedJournalId;
  }

  if (ARTICLE_STATUS_VALUES.includes(status)) {
    filter.$or = [{ status }, ...(status === ARTICLE_STATUSES.IN_PRESS ? [{ status: { $exists: false }, inPress: true }] : [])];
  }

  const articles = await Article.find(filter)
    .populate("journal", "managingJournalName journalUrl")
    .populate("issue")
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  const serialized = articles.map(serializeArticle);
  const filtered = search
    ? serialized.filter((article) =>
        [article.title, article.authorNames, article.keywords, article.articleType, article.managingJournalName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search))
      )
    : serialized;

  res.json(filtered);
});

export const getArticlesByIssue = asyncHandler(async (req, res) => {
  const articles = await Article.find({ issue: req.params.id }).sort({ createdAt: -1 }).lean();
  res.json(
    articles
      .filter((article) => deriveArticleStatus(article) === ARTICLE_STATUSES.CURRENT_ISSUE)
      .map((article) => ({
        id: article._id,
        title: article.title,
        authors: article.authors,
        pdfUrl: article.pdfFile?.secure_url || null
      }))
  );
});

export const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id).populate("journal", "managingJournalName journalUrl").populate("issue");

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  res.json(serializeArticle(article));
});

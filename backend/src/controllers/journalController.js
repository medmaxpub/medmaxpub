import Article from "../models/Article.js";
import EditorialBoardMember from "../models/EditorialBoardMember.js";
import Issue from "../models/Issue.js";
import Journal from "../models/Journal.js";
import JournalPdf from "../models/JournalPdf.js";
import Ppt from "../models/Ppt.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import { ARTICLE_STATUSES, deriveArticleStatus } from "./articleController.js";
import { serializePpt } from "../services/pptService.js";
import { ensureJournalAccess, hasElevatedAccess, normalizeRole } from "../utils/accessControl.js";
import { deleteAsset, uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractJournalValue(value) {
  const normalized = safeDecode(normalizeText(value)).replace(/\\/g, "/");

  if (!normalized) {
    return "";
  }

  const withoutProtocol = normalized.replace(/^https?:\/+/i, "").replace(/^www\./i, "");
  const journalMatch = withoutProtocol.match(/(?:^|\/)journal\/([^/?#]+)/i);

  if (journalMatch?.[1]) {
    return journalMatch[1];
  }

  return withoutProtocol.split("/").filter(Boolean).pop() || withoutProtocol;
}

function normalizeUserName(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeJournalUrl(value) {
  return extractJournalValue(value)
    .toLowerCase()
    .replace(/%20/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-?home-[a-z0-9-]+$/i, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeJournalSlug(value) {
  return normalizeJournalUrl(value)
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildJournalPayload(body) {
  const normalizedJournalUrl = normalizeJournalUrl(body.journalUrl);

  return {
    ownerUserId: normalizeText(body.ownerUserId),
    firstName: normalizeText(body.firstName),
    lastName: normalizeText(body.lastName),
    userName: normalizeUserName(body.username || body.userName),
    password: normalizeText(body.password),
    managingJournalName: normalizeText(body.managingJournalName),
    journalDomainName: normalizeText(body.journalDomainName),
    journalUrl: normalizedJournalUrl,
    slug: normalizeJournalSlug(body.slug || normalizedJournalUrl || body.managingJournalName),
    aboutJournal: normalizeText(body.aboutJournal),
    journalInstructions: normalizeText(body.journalInstructions)
  };
}

function validateJournalPayload(payload, options = {}) {
  const requireLinkedUserFields = options.requireLinkedUserFields ?? !payload.ownerUserId;
  const requiredFields = {
    managingJournalName: "Managing journal name",
    journalDomainName: "Journal domain name",
    slug: "Journal slug",
    journalUrl: "Journal URL",
    aboutJournal: "About journal",
    journalInstructions: "Journal instructions"
  };

  if (requireLinkedUserFields) {
    requiredFields.firstName = "First name";
    requiredFields.lastName = "Last name";
    requiredFields.userName = "User name";
    requiredFields.password = "Password";
  }

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!payload[field]) {
      throw new AppError(`${label} is required`, 400);
    }
  }
}

function serializeJournalSummary(journal) {
  const legacyPdfFiles =
    journal.pdfFile && !(journal.pdfFiles || []).length
      ? [
          {
            id: `legacy-${journal._id}`,
            title: `${normalizeText(journal.managingJournalName) || "Journal"} PDF`,
            fileUrl: journal.pdfFile?.secure_url || "",
            uploadedAt: journal.pdfFile?.uploaded_at || ""
          }
        ]
      : [];

  return {
    id: journal._id,
    ownerUserId: journal.owner?._id || journal.owner,
    ownerName:
      journal.owner && typeof journal.owner === "object"
        ? [journal.owner.firstName, journal.owner.lastName].filter(Boolean).join(" ").trim()
        : [journal.firstName, journal.lastName].filter(Boolean).join(" ").trim(),
    ownerUsername: journal.owner && typeof journal.owner === "object" ? journal.owner.userName : "",
    firstName: normalizeText(journal.firstName),
    lastName: normalizeText(journal.lastName),
    username:
      journal.owner && typeof journal.owner === "object"
        ? normalizeText(journal.owner.userName)
        : normalizeText(journal.userName),
    slug: normalizeText(journal.slug),
    publicJournalUrl: normalizeJournalUrl(journal.slug || journal.journalUrl || journal.managingJournalName),
    managingJournalName: normalizeText(journal.managingJournalName),
    journalDomainName: normalizeText(journal.journalDomainName),
    journalUrl: normalizeText(journal.journalUrl),
    aboutJournal: normalizeText(journal.aboutJournal),
    journalInstructions: normalizeText(journal.journalInstructions),
    pdfFileUrl: journal.pdfFile?.secure_url || "",
    pdfFiles: [
      ...(journal.pdfFiles || []).map((item) => ({
        id: item._id,
        title: item.title,
        fileUrl: item.file?.secure_url || "",
        uploadedAt: item.createdAt || item.file?.uploaded_at || ""
      })),
      ...legacyPdfFiles
    ]
  };
}

async function buildJournalDetails(journal) {
  const issues = await Issue.find({ journal: journal._id }).sort({ year: -1, volume: -1, issue: -1 }).lean();
  const ppts = await Ppt.find({ journal: journal._id }).sort({ createdAt: -1 }).lean();
  const pdfFiles = await JournalPdf.find({ journal: journal._id }).sort({ createdAt: -1 }).lean();
  const videos = await Video.find({ journal: journal._id }).sort({ createdAt: -1 }).lean();
  const issueIds = issues.map((item) => item._id);
  const articles = await Article.find({ issue: { $in: issueIds } }).lean();

  const currentByIssue = new Map();
  const archiveByIssue = new Map();
  articles.forEach((article) => {
    const status = deriveArticleStatus(article);

    if (!article.issue || (status !== ARTICLE_STATUSES.CURRENT_ISSUE && status !== ARTICLE_STATUSES.ARCHIVED)) {
      return;
    }

    const key = article.issue.toString();
    const targetMap = status === ARTICLE_STATUSES.CURRENT_ISSUE ? currentByIssue : archiveByIssue;
    const list = targetMap.get(key) || [];
    list.push({
      id: article._id,
      title: article.title,
      authors: article.authors,
      pdfUrl: article.pdfFile?.secure_url || null
    });
    targetMap.set(key, list);
  });

  const formattedIssues = issues.map((issue) => ({
    id: issue._id,
    volume: issue.volume,
    issue: issue.issue,
    month: issue.month || "",
    year: issue.year,
    currentArticles: currentByIssue.get(issue._id.toString()) || [],
    archivedArticles: archiveByIssue.get(issue._id.toString()) || []
  }));

  const visibleCurrentIssues = formattedIssues.filter((item) => item.currentArticles.length);
  const currentIssue =
    visibleCurrentIssues.find((item, index) => {
      const originalIssue = issues.find((issue) => issue._id.toString() === item.id.toString());
      return originalIssue?.isCurrent;
    }) ||
    visibleCurrentIssues[0] ||
    null;

  const archiveMap = new Map();
  formattedIssues.forEach((issueItem) => {
    if (!issueItem.archivedArticles.length) {
      return;
    }

    const yearMap = archiveMap.get(issueItem.year) || new Map();
    const volumeList = yearMap.get(issueItem.volume) || [];
    volumeList.push({
      issue: issueItem.issue,
      month: issueItem.month,
      articles: issueItem.archivedArticles
    });
    yearMap.set(issueItem.volume, volumeList);
    archiveMap.set(issueItem.year, yearMap);
  });

  const archive = [...archiveMap.entries()].map(([year, volumeMap]) => ({
    year,
    volumes: [...volumeMap.entries()].map(([volume, issuesList]) => ({
      volume,
      issues: issuesList
    }))
  }));

  return {
    ...serializeJournalSummary(journal),
    currentIssue: currentIssue
      ? {
          id: currentIssue.id,
          volume: currentIssue.volume,
          issue: currentIssue.issue,
          month: currentIssue.month,
          year: currentIssue.year,
          articles: currentIssue.currentArticles
        }
      : null,
    archive,
    pdfFiles: pdfFiles.map((item) => ({
      id: item._id,
      title: item.title,
      fileUrl: item.file?.secure_url || "",
      uploadedAt: item.createdAt || item.file?.uploaded_at || ""
    })),
    ppts: ppts.map((ppt) => serializePpt(ppt)),
    videos: videos.map((video) => ({
      id: video._id,
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl || "",
      videoUrl: video.videoFile?.secure_url || null,
      thumbnailUrl: video.thumbnail?.secure_url || null
    }))
  };
}

async function ensureUniqueJournalUrl(journalUrl, currentJournalId = null) {
  const existingJournal = await Journal.findOne({ journalUrl });

  if (existingJournal && existingJournal._id.toString() !== currentJournalId?.toString()) {
    throw new AppError("Journal URL is already in use", 400);
  }
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function ensureUniqueUserName(userName, currentUserId = null) {
  const existingUser = await User.findOne({ userName });

  if (existingUser && existingUser._id.toString() !== currentUserId?.toString()) {
    throw new AppError("Username is already in use", 400);
  }
}

async function syncUserJournals(userId) {
  const journals = await Journal.find({ owner: userId }).select("_id").lean();

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        assignedJournals: journals.map((journal) => journal._id)
      }
    }
  );

  return journals;
}

async function upsertLinkedOwner(req, payload, existingJournal = null) {
  if (normalizeRole(req.user.role) === "user") {
    const owner = await User.findById(req.user._id);

    if (!owner) {
      throw new AppError("User account not found", 404);
    }

    const nextUserName = payload.userName || owner.userName;
    await ensureUniqueUserName(nextUserName, owner._id);
    owner.firstName = payload.firstName || owner.firstName;
    owner.lastName = payload.lastName || owner.lastName;
    owner.userName = nextUserName;

    if (payload.password) {
      owner.password = payload.password;
    }

    owner.role = "user";
    await owner.save();
    return owner;
  }

  if (existingJournal?.owner) {
    const owner = await User.findById(existingJournal.owner);

    if (!owner) {
      throw new AppError("Linked user account not found", 404);
    }

    await ensureUniqueUserName(payload.userName, owner._id);
    owner.firstName = payload.firstName;
    owner.lastName = payload.lastName;
    owner.userName = payload.userName;
    owner.password = payload.password;
    owner.role = "user";
    await owner.save();
    return owner;
  }

  if (payload.ownerUserId) {
    const owner = await User.findById(payload.ownerUserId);

    if (!owner) {
      throw new AppError("Selected user account not found", 404);
    }

    if (normalizeRole(owner.role) !== "user") {
      throw new AppError("Journal can only be attached to a standard user account", 400);
    }

    return owner;
  }

  await ensureUniqueUserName(payload.userName);

  return User.create({
    firstName: payload.firstName,
    lastName: payload.lastName,
    userName: payload.userName,
    password: payload.password,
    role: "user"
  });
}

export const getJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find().populate("owner", "firstName lastName userName").sort({ createdAt: -1 }).lean();
  res.json(journals.map(serializeJournalSummary));
});

export const getAdminJournals = asyncHandler(async (req, res) => {
  const filter = hasElevatedAccess(req.user) ? {} : { owner: req.user._id };
  const journals = await Journal.find(filter).populate("owner", "firstName lastName userName").sort({ createdAt: -1 }).lean();
  res.json(journals.map(serializeJournalSummary));
});

export const getJournalByUrl = asyncHandler(async (req, res) => {
  const normalizedRequestedUrl = normalizeJournalUrl(req.params.journalUrl);

  let journal = await Journal.findOne({
    $or: [{ journalUrl: normalizedRequestedUrl }, { slug: normalizedRequestedUrl }]
  })
    .populate("owner", "firstName lastName userName")
    .lean();

  if (!journal) {
    const looseCandidates = await Journal.find({
      $or: [
        { journalUrl: { $regex: escapeRegExp(normalizedRequestedUrl), $options: "i" } },
        { slug: { $regex: escapeRegExp(normalizedRequestedUrl), $options: "i" } }
      ]
    })
      .populate("owner", "firstName lastName userName")
      .lean();

    journal =
      looseCandidates.find(
        (item) => normalizeJournalUrl(item.slug || item.journalUrl || item.managingJournalName) === normalizedRequestedUrl
      ) || null;
  }

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  res.json(await buildJournalDetails(journal));
});

export const createJournal = asyncHandler(async (req, res) => {
  const payload = buildJournalPayload(req.body);
  const isUserOwnedCreate = normalizeRole(req.user.role) === "user";
  validateJournalPayload(payload, { requireLinkedUserFields: !isUserOwnedCreate && !payload.ownerUserId });
  await ensureUniqueJournalUrl(payload.journalUrl);

  const owner = await upsertLinkedOwner(req, payload);

  const ownerFirstName = isUserOwnedCreate || payload.ownerUserId ? owner.firstName : payload.firstName;
  const ownerLastName = isUserOwnedCreate || payload.ownerUserId ? owner.lastName : payload.lastName;

  const journal = await Journal.create({
    owner: owner._id,
    firstName: ownerFirstName,
    lastName: ownerLastName,
    slug: payload.slug,
    managingJournalName: payload.managingJournalName,
    journalDomainName: payload.journalDomainName,
    journalUrl: payload.journalUrl,
    aboutJournal: payload.aboutJournal,
    journalInstructions: payload.journalInstructions
  });

  await syncUserJournals(owner._id);
  const populatedJournal = await Journal.findById(journal._id).populate("owner", "firstName lastName userName").lean();
  res.status(201).json(serializeJournalSummary(populatedJournal));
});

export const updateJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.id);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  await ensureJournalAccess(req.user, journal._id);

  const payload = buildJournalPayload(req.body);
  const isUserOwnedUpdate = normalizeRole(req.user.role) === "user";
  validateJournalPayload(payload, { requireLinkedUserFields: !isUserOwnedUpdate && !payload.ownerUserId });
  await ensureUniqueJournalUrl(payload.journalUrl, journal._id);

  const previousOwnerId = journal.owner?.toString();
  const owner = await upsertLinkedOwner(req, payload, journal);

  journal.owner = owner._id;
  journal.firstName = isUserOwnedUpdate || payload.ownerUserId ? owner.firstName : payload.firstName;
  journal.lastName = isUserOwnedUpdate || payload.ownerUserId ? owner.lastName : payload.lastName;
  journal.slug = payload.slug;
  journal.managingJournalName = payload.managingJournalName;
  journal.journalDomainName = payload.journalDomainName;
  journal.journalUrl = payload.journalUrl;
  journal.aboutJournal = payload.aboutJournal;
  journal.journalInstructions = payload.journalInstructions;
  await journal.save();

  await syncUserJournals(owner._id);

  if (previousOwnerId && previousOwnerId !== owner._id.toString()) {
    await syncUserJournals(previousOwnerId);
  }

  const populatedJournal = await Journal.findById(journal._id).populate("owner", "firstName lastName userName").lean();
  res.json(serializeJournalSummary(populatedJournal));
});

export const deleteJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.id);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  await ensureJournalAccess(req.user, journal._id);

  const ownerId = journal.owner?.toString();

  await Article.deleteMany({ journal: journal._id });
  await Issue.deleteMany({ journal: journal._id });
  await EditorialBoardMember.deleteMany({ journal: journal._id });
  await Ppt.deleteMany({ journal: journal._id });
  await Video.deleteMany({ journal: journal._id });
  await journal.deleteOne();

  if (ownerId) {
    await syncUserJournals(ownerId);
  }

  res.status(204).send();
});

export const getJournalIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ journal: req.params.id }).sort({ year: -1, volume: -1, issue: -1 }).lean();
  res.json(issues);
});

export const uploadJournalPdf = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.journalId);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  await ensureJournalAccess(req.user, journal._id);

  const uploadedFiles = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];

  if (!uploadedFiles.length) {
    throw new AppError("At least one PDF file is required", 400);
  }

  const createdItems = [];

  for (const file of uploadedFiles) {
    const asset = await uploadAsset(file, "medmaxpub/journal-pdfs", "raw", req);
    const title = normalizeText(req.body.title) || file.originalname?.replace(/\.[^.]+$/, "") || "Journal PDF";

    const createdItem = await JournalPdf.create({
      journal: journal._id,
      title,
      file: asset
    });

    createdItems.push(createdItem);
  }

  if (!journal.pdfFile && createdItems[0]?.file) {
    if (!journal.slug) {
      journal.slug = normalizeJournalSlug(journal.journalUrl || journal.managingJournalName);
    }
    journal.pdfFile = createdItems[0].file;
    await journal.save();
  }

  res.json({
    items: createdItems.map((item) => ({
      id: item._id,
      title: item.title,
      fileUrl: item.file?.secure_url || "",
      uploadedAt: item.createdAt
    }))
  });
});

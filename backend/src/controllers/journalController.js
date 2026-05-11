import Article from "../models/Article.js";
import Issue from "../models/Issue.js";
import Journal from "../models/Journal.js";
import Ppt from "../models/Ppt.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import { serializePpt } from "../services/pptService.js";
import { ensureJournalAccess, normalizeRole } from "../utils/accessControl.js";
import { deleteAsset, uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeUserName(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeJournalUrl(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-");
}

function buildJournalPayload(body) {
  return {
    firstName: normalizeText(body.firstName),
    lastName: normalizeText(body.lastName),
    userName: normalizeUserName(body.username || body.userName),
    password: normalizeText(body.password),
    managingJournalName: normalizeText(body.managingJournalName),
    journalDomainName: normalizeText(body.journalDomainName),
    journalUrl: normalizeJournalUrl(body.journalUrl),
    aboutJournal: normalizeText(body.aboutJournal),
    journalInstructions: normalizeText(body.journalInstructions)
  };
}

function validateJournalPayload(payload) {
  const requiredFields = {
    firstName: "First name",
    lastName: "Last name",
    userName: "User name",
    password: "Password",
    managingJournalName: "Managing journal name",
    journalDomainName: "Journal domain name",
    journalUrl: "Journal URL",
    aboutJournal: "About journal",
    journalInstructions: "Journal instructions"
  };

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!payload[field]) {
      throw new AppError(`${label} is required`, 400);
    }
  }
}

function serializeJournalSummary(journal) {
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
    managingJournalName: normalizeText(journal.managingJournalName),
    journalDomainName: normalizeText(journal.journalDomainName),
    journalUrl: normalizeText(journal.journalUrl),
    aboutJournal: normalizeText(journal.aboutJournal),
    journalInstructions: normalizeText(journal.journalInstructions),
    pdfFileUrl: journal.pdfFile?.secure_url || ""
  };
}

async function buildJournalDetails(journal) {
  const issues = await Issue.find({ journal: journal._id }).sort({ year: -1, volume: -1, issue: -1 }).lean();
  const ppts = await Ppt.find({ journal: journal._id }).sort({ createdAt: -1 }).lean();
  const videos = await Video.find({ journal: journal._id }).sort({ createdAt: -1 }).lean();
  const issueIds = issues.map((item) => item._id);
  const articles = await Article.find({ issue: { $in: issueIds } }).lean();

  const byIssue = new Map();
  articles.forEach((article) => {
    const key = article.issue.toString();
    const list = byIssue.get(key) || [];
    list.push({
      id: article._id,
      title: article.title,
      authors: article.authors,
      pdfUrl: article.pdfFile?.secure_url || null
    });
    byIssue.set(key, list);
  });

  const formattedIssues = issues.map((issue) => ({
    id: issue._id,
    volume: issue.volume,
    issue: issue.issue,
    year: issue.year,
    articles: byIssue.get(issue._id.toString()) || []
  }));

  const currentIssue = formattedIssues.find((item, index) => issues[index].isCurrent) || formattedIssues[0] || null;

  const archiveMap = new Map();
  formattedIssues.forEach((issueItem) => {
    const yearMap = archiveMap.get(issueItem.year) || new Map();
    const volumeList = yearMap.get(issueItem.volume) || [];
    volumeList.push({
      issue: issueItem.issue,
      articles: issueItem.articles
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
    currentIssue,
    archive,
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

    await ensureUniqueUserName(payload.userName, owner._id);
    owner.firstName = payload.firstName;
    owner.lastName = payload.lastName;
    owner.userName = payload.userName;
    owner.password = payload.password;
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
  const filter = normalizeRole(req.user.role) === "admin" ? {} : { owner: req.user._id };
  const journals = await Journal.find(filter).populate("owner", "firstName lastName userName").sort({ createdAt: -1 }).lean();
  res.json(journals.map(serializeJournalSummary));
});

export const getJournalByUrl = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ journalUrl: normalizeJournalUrl(req.params.journalUrl) })
    .populate("owner", "firstName lastName userName")
    .lean();

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  res.json(await buildJournalDetails(journal));
});

export const createJournal = asyncHandler(async (req, res) => {
  const payload = buildJournalPayload(req.body);
  validateJournalPayload(payload);
  await ensureUniqueJournalUrl(payload.journalUrl);

  const owner = await upsertLinkedOwner(req, payload);

  const journal = await Journal.create({
    owner: owner._id,
    firstName: payload.firstName,
    lastName: payload.lastName,
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
  validateJournalPayload(payload);
  await ensureUniqueJournalUrl(payload.journalUrl, journal._id);

  const previousOwnerId = journal.owner?.toString();
  const owner = await upsertLinkedOwner(req, payload, journal);

  journal.owner = owner._id;
  journal.firstName = payload.firstName;
  journal.lastName = payload.lastName;
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

  if (journal.pdfFile) {
    await deleteAsset(journal.pdfFile, "raw");
  }

  journal.pdfFile = await uploadAsset(req.file, "medmaxpub/journal-pdfs", "raw", req);
  await journal.save();

  res.json({
    id: journal._id,
    pdfFileUrl: journal.pdfFile?.secure_url || ""
  });
});

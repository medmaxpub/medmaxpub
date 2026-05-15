import Journal from "../models/Journal.js";
import ManuscriptSubmission from "../models/ManuscriptSubmission.js";
import { buildAccessibleJournalFilter } from "../utils/accessControl.js";
import { uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isSampleJournalRecord } from "../utils/sampleContent.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function serializeSubmission(item) {
  return {
    id: item._id,
    name: item.name,
    email: item.email,
    postalAddress: item.postalAddress,
    country: item.country,
    journalId: item.journal?._id || item.journal || null,
    journalTitle: item.journal?.managingJournalName || "",
    journalUrl: item.journal?.journalUrl || "",
    articleType: item.articleType,
    manuscriptTitle: item.manuscriptTitle,
    abstract: item.abstract,
    status: item.status || "pending",
    files: (item.files || []).map((file, index) => ({
      id: `${item._id}-file-${index}`,
      name: file.original_filename || `Submission File ${index + 1}`,
      url: file.secure_url || "",
      asset: file
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

export const createManuscriptSubmission = asyncHandler(async (req, res) => {
  const journalId = normalizeText(req.body.journalId);
  const journal = journalId ? await Journal.findById(journalId).lean() : null;

  if (!journal || isSampleJournalRecord(journal)) {
    throw new AppError("Journal not found", 404);
  }

  const payload = {
    name: normalizeText(req.body.name),
    email: normalizeText(req.body.email).toLowerCase(),
    postalAddress: normalizeText(req.body.postalAddress),
    country: normalizeText(req.body.country),
    articleType: normalizeText(req.body.articleType),
    manuscriptTitle: normalizeText(req.body.manuscriptTitle),
    abstract: normalizeText(req.body.abstract)
  };

  const requiredFields = {
    name: "Name",
    email: "Email address",
    postalAddress: "Postal address",
    country: "Country",
    articleType: "Article type",
    manuscriptTitle: "Manuscript title",
    abstract: "Abstract"
  };

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!payload[field]) {
      throw new AppError(`${label} is required`, 400);
    }
  }

  const uploadedFiles = await Promise.all(
    (req.files || []).map((file) => uploadAsset(file, "medmaxpub/submissions", "raw", req))
  );

  const submission = await ManuscriptSubmission.create({
    ...payload,
    journal: journal._id,
    files: uploadedFiles
  });

  const populatedSubmission = await ManuscriptSubmission.findById(submission._id)
    .populate("journal", "managingJournalName journalUrl")
    .lean();

  res.status(201).json({
    ...serializeSubmission(populatedSubmission),
    message: "Manuscript submitted successfully."
  });
});

export const getAdminManuscriptSubmissions = asyncHandler(async (req, res) => {
  const submissions = await ManuscriptSubmission.find(buildAccessibleJournalFilter(req.user))
    .populate("journal", "managingJournalName journalUrl")
    .sort({ createdAt: -1 })
    .lean();

  res.json(
    submissions
      .filter((item) => item.journal && !isSampleJournalRecord(item.journal))
      .map(serializeSubmission)
  );
});

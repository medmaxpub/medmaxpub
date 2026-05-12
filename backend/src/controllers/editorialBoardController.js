import EditorialBoardMember from "../models/EditorialBoardMember.js";
import Journal from "../models/Journal.js";
import { buildAccessibleJournalFilter, ensureJournalAccess } from "../utils/accessControl.js";
import { deleteAsset, uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function serializeEditorialBoardMember(item) {
  return {
    id: item._id,
    journalId: item.journal?._id || item.journal,
    managingJournalName: item.journal?.managingJournalName || "",
    editorType: item.editorType || item.designation || "",
    name: item.name || "",
    designation: item.designation || "",
    department: item.department || "",
    country: item.country || "",
    editorDescription: item.editorDescription || "",
    editorBiography: item.editorBiography || "",
    profileUrl: item.profileUrl || "",
    profileImageUrl: item.profileImage?.secure_url || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
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

export const getEditorialBoardMembers = asyncHandler(async (req, res) => {
  const items = await EditorialBoardMember.find(buildAccessibleJournalFilter(req.user))
    .populate("journal", "managingJournalName")
    .sort({ createdAt: -1 })
    .lean();

  res.json(items.map(serializeEditorialBoardMember));
});

export const createEditorialBoardMember = asyncHandler(async (req, res) => {
  const journalId = await resolveJournalId(req);
  await ensureJournalAccess(req.user, journalId);

  const editorType = normalizeText(req.body.editorType);
  const name = normalizeText(req.body.name);
  const designation = normalizeText(req.body.designation);
  const department = normalizeText(req.body.department);
  const country = normalizeText(req.body.country);
  const editorDescription = normalizeText(req.body.editorDescription);
  const editorBiography = normalizeText(req.body.editorBiography);
  const profileUrl = normalizeText(req.body.profileUrl);

  if (!editorType || !name) {
    throw new AppError("Editor type and editor name are required", 400);
  }

  const profileImage = await uploadAsset(req.file, "medmaxpub/editorial-board", "image", req);
  const item = await EditorialBoardMember.create({
    journal: journalId,
    editorType,
    name,
    designation,
    department,
    country,
    editorDescription,
    editorBiography,
    profileUrl,
    profileImage
  });

  const populatedItem = await EditorialBoardMember.findById(item._id).populate("journal", "managingJournalName");
  res.status(201).json(serializeEditorialBoardMember(populatedItem));
});

export const updateEditorialBoardMember = asyncHandler(async (req, res) => {
  const item = await EditorialBoardMember.findById(req.params.id);

  if (!item) {
    throw new AppError("Editorial board member not found", 404);
  }

  await ensureJournalAccess(req.user, item.journal);

  const editorType = normalizeText(req.body.editorType);
  const name = normalizeText(req.body.name);
  const designation = normalizeText(req.body.designation);
  const department = normalizeText(req.body.department);
  const country = normalizeText(req.body.country);
  const editorDescription = normalizeText(req.body.editorDescription);
  const editorBiography = normalizeText(req.body.editorBiography);
  const profileUrl = normalizeText(req.body.profileUrl);

  if (!editorType || !name) {
    throw new AppError("Editor type and editor name are required", 400);
  }

  if (req.file) {
    await deleteAsset(item.profileImage, "image");
    item.profileImage = await uploadAsset(req.file, "medmaxpub/editorial-board", "image", req);
  }

  item.editorType = editorType;
  item.name = name;
  item.designation = designation;
  item.department = department;
  item.country = country;
  item.editorDescription = editorDescription;
  item.editorBiography = editorBiography;
  item.profileUrl = profileUrl;
  await item.save();

  const populatedItem = await EditorialBoardMember.findById(item._id).populate("journal", "managingJournalName");
  res.json(serializeEditorialBoardMember(populatedItem));
});

export const deleteEditorialBoardMember = asyncHandler(async (req, res) => {
  const item = await EditorialBoardMember.findById(req.params.id);

  if (!item) {
    throw new AppError("Editorial board member not found", 404);
  }

  await ensureJournalAccess(req.user, item.journal);
  await deleteAsset(item.profileImage, "image");
  await item.deleteOne();

  res.status(204).send();
});

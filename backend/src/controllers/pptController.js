import Journal from "../models/Journal.js";
import Ppt from "../models/Ppt.js";
import { createPptRecord, ensurePptPreviewAsset, serializePpt } from "../services/pptService.js";
import { buildAccessibleJournalFilter, ensureJournalAccess } from "../utils/accessControl.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadPpt = asyncHandler(async (req, res) => {
  const requestedJournalId = req.params.journalId || req.body.journalId;
  const journal = await Journal.findById(requestedJournalId);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  await ensureJournalAccess(req.user, journal._id);

  const ppt = await createPptRecord({
    journalId: journal._id,
    title: req.body.title,
    description: req.body.description,
    pptUpload: req.files?.pptFile?.[0],
    previewUpload: req.files?.previewFile?.[0],
    req
  });

  const populatedPpt = await Ppt.findById(ppt._id).populate("journal", "managingJournalName journalUrl journalDomainName").lean();
  res.set("Cache-Control", "no-store");
  res.status(201).json({
    ...serializePpt(populatedPpt),
    message: ppt.previewPdfUrl ? "PPT uploaded and preview PDF generated." : "PPT uploaded. Preview PDF generation failed."
  });
});

export const getPpts = asyncHandler(async (req, res) => {
  const ppts = await Ppt.find().populate("journal", "managingJournalName journalUrl journalDomainName").sort({ createdAt: -1 });

  for (const ppt of ppts) {
    await ensurePptPreviewAsset(ppt, req);
  }

  res.set("Cache-Control", "no-store");
  res.json(ppts.map((ppt) => serializePpt(ppt.toObject())));
});

export const getAdminPpts = asyncHandler(async (req, res) => {
  const ppts = await Ppt.find(buildAccessibleJournalFilter(req.user))
    .populate("journal", "managingJournalName journalUrl journalDomainName")
    .sort({ createdAt: -1 });

  for (const ppt of ppts) {
    await ensurePptPreviewAsset(ppt, req);
  }

  res.set("Cache-Control", "no-store");
  res.json(ppts.map((ppt) => serializePpt(ppt.toObject())));
});

export const getPptById = asyncHandler(async (req, res) => {
  const ppt = await Ppt.findById(req.params.id).populate("journal", "managingJournalName journalUrl journalDomainName");

  if (!ppt) {
    throw new AppError("PPT not found", 404);
  }

  await ensurePptPreviewAsset(ppt, req);
  res.set("Cache-Control", "no-store");
  res.json(serializePpt(ppt.toObject()));
});

export const regeneratePptPreview = asyncHandler(async (req, res) => {
  const ppt = await Ppt.findById(req.params.id).populate("journal", "managingJournalName journalUrl journalDomainName");

  if (!ppt) {
    throw new AppError("PPT not found", 404);
  }

  await ensureJournalAccess(req.user, ppt.journal?._id || ppt.journal);
  await ensurePptPreviewAsset(ppt, req, { force: true });
  res.set("Cache-Control", "no-store");
  res.json({
    ...serializePpt(ppt.toObject()),
    message: ppt.previewPdfUrl ? "Preview PDF regenerated successfully." : "Preview PDF regeneration failed."
  });
});

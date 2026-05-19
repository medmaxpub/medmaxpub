import Journal from "../models/Journal.js";
import Ppt from "../models/Ppt.js";
import { createPptRecord, ensurePptPreviewAsset, resolvePptCoverAsset, serializePpt, updatePptRecord } from "../services/pptService.js";
import { buildAccessibleJournalFilter, ensureJournalAccess } from "../utils/accessControl.js";
import { deleteAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { filterSampleMediaItems, isSampleJournalRecord } from "../utils/sampleContent.js";

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
    authorName: req.body.authorName,
    doiNumber: req.body.doiNumber,
    pptUpload: req.files?.pptFile?.[0],
    previewUpload: req.files?.previewFile?.[0],
    coverImageUpload: req.files?.coverImage?.[0],
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
  const ppts = await Ppt.find()
    .populate("journal", "managingJournalName journalUrl journalDomainName slug firstName lastName aboutJournal")
    .sort({ createdAt: -1 })
    .lean();

  res.set("Cache-Control", "no-store");
  res.json(filterSampleMediaItems(ppts).map((ppt) => serializePpt(ppt)));
});

export const getAdminPpts = asyncHandler(async (req, res) => {
  const ppts = await Ppt.find(buildAccessibleJournalFilter(req.user))
    .populate("journal", "managingJournalName journalUrl journalDomainName slug firstName lastName aboutJournal")
    .sort({ createdAt: -1 })
    .lean();

  res.set("Cache-Control", "no-store");
  res.json(filterSampleMediaItems(ppts).map((ppt) => serializePpt(ppt)));
});

export const getPptById = asyncHandler(async (req, res) => {
  const ppt = await Ppt.findById(req.params.id).populate("journal", "managingJournalName journalUrl journalDomainName");

  if (!ppt) {
    throw new AppError("PPT not found", 404);
  }

  if (isSampleJournalRecord(ppt.journal)) {
    throw new AppError("PPT not found", 404);
  }

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

export const deletePpt = asyncHandler(async (req, res) => {
  const ppt = await Ppt.findById(req.params.id).populate("journal", "managingJournalName journalUrl journalDomainName");

  if (!ppt) {
    throw new AppError("PPT not found", 404);
  }

  if (isSampleJournalRecord(ppt.journal)) {
    throw new AppError("PPT not found", 404);
  }

  await ensureJournalAccess(req.user, ppt.journal?._id || ppt.journal);
  await deleteAsset(resolvePptCoverAsset(ppt), "image");
  await deleteAsset(ppt.file || ppt.pptFile, "raw");
  await deleteAsset(ppt.previewFile || ppt.pdfPreviewFile, "image");
  await ppt.deleteOne();

  res.status(204).send();
});

export const updatePpt = asyncHandler(async (req, res) => {
  const ppt = await Ppt.findById(req.params.id).populate("journal", "managingJournalName journalUrl journalDomainName");

  if (!ppt) {
    throw new AppError("PPT not found", 404);
  }

  if (isSampleJournalRecord(ppt.journal)) {
    throw new AppError("PPT not found", 404);
  }

  const requestedJournalId = req.body.journalId || ppt.journal?._id || ppt.journal;
  const journal = await Journal.findById(requestedJournalId);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  await ensureJournalAccess(req.user, requestedJournalId);

  await updatePptRecord({
    ppt,
    journalId: journal._id,
    title: req.body.title,
    description: req.body.description,
    authorName: req.body.authorName,
    doiNumber: req.body.doiNumber,
    pptUpload: req.files?.pptFile?.[0],
    previewUpload: req.files?.previewFile?.[0],
    coverImageUpload: req.files?.coverImage?.[0],
    req,
    deleteAsset
  });

  const populatedPpt = await Ppt.findById(ppt._id).populate("journal", "managingJournalName journalUrl journalDomainName").lean();
  res.set("Cache-Control", "no-store");
  res.json({
    ...serializePpt(populatedPpt),
    message: "PPT updated successfully."
  });
});

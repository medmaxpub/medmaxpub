import Journal from "../models/Journal.js";
import Ppt from "../models/Ppt.js";
import { buildAccessibleJournalFilter, ensureJournalAccess } from "../utils/accessControl.js";
import { uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generatePreviewAssetFromStoredFile, generatePreviewAssetFromUpload } from "../utils/pptPreviewService.js";

export const uploadPpt = asyncHandler(async (req, res) => {
  const requestedJournalId = req.params.journalId || req.body.journalId;
  const journal = await Journal.findById(requestedJournalId);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  ensureJournalAccess(req.user, journal._id);

  const sourcePptFile = req.files?.pptFile?.[0];
  const sourcePreviewFile = req.files?.previewFile?.[0];
  const pptFile = await uploadAsset(sourcePptFile, "medmaxpub/ppts", "raw", req);
  const previewFile =
    (await uploadAsset(sourcePreviewFile, "medmaxpub/ppts", "raw", req)) ||
    (await generatePreviewAssetFromUpload(sourcePptFile, req));

  const ppt = await Ppt.create({
    journal: journal._id,
    title: req.body.title,
    description: req.body.description,
    file: pptFile,
    previewFile
  });

  const populatedPpt = await Ppt.findById(ppt._id).populate("journal", "title slug").lean();
  res.status(201).json(populatedPpt);
});

export const getPpts = asyncHandler(async (req, res) => {
  const ppts = await Ppt.find().populate("journal", "title slug").sort({ createdAt: -1 });

  for (const ppt of ppts) {
    if (!ppt.previewFile && ppt.file) {
      const generatedPreview = await generatePreviewAssetFromStoredFile(ppt.file, req);

      if (generatedPreview) {
        ppt.previewFile = generatedPreview;
        await ppt.save();
      }
    }
  }

  res.json(ppts.map((ppt) => ppt.toObject()));
});

export const getAdminPpts = asyncHandler(async (req, res) => {
  const ppts = await Ppt.find(buildAccessibleJournalFilter(req.user))
    .populate("journal", "title slug")
    .sort({ createdAt: -1 });

  for (const ppt of ppts) {
    if (!ppt.previewFile && ppt.file) {
      const generatedPreview = await generatePreviewAssetFromStoredFile(ppt.file, req);

      if (generatedPreview) {
        ppt.previewFile = generatedPreview;
        await ppt.save();
      }
    }
  }

  res.json(ppts.map((ppt) => ppt.toObject()));
});

export const getPptById = asyncHandler(async (req, res) => {
  const ppt = await Ppt.findById(req.params.id).populate("journal", "title slug");

  if (!ppt) {
    throw new AppError("PPT not found", 404);
  }

  res.json(ppt);
});

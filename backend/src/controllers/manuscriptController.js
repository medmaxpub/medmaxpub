import Journal from "../models/Journal.js";
import Manuscript from "../models/Manuscript.js";
import { buildAccessibleJournalFilter } from "../utils/accessControl.js";
import { uploadAsset } from "../utils/assetStorage.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const submitManuscript = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.body.journalId);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  const file = await uploadAsset(req.file, "medmaxpub/manuscripts", "raw", req);

  const manuscript = await Manuscript.create({
    authorName: req.body.authorName,
    email: req.body.email,
    phone: req.body.phone,
    journal: journal._id,
    manuscriptTitle: req.body.manuscriptTitle,
    comments: req.body.comments || req.body.message || "",
    file
  });

  res.status(201).json(manuscript);
});

export const getManuscripts = asyncHandler(async (req, res) => {
  const manuscripts = await Manuscript.find(buildAccessibleJournalFilter(req.user))
    .populate("journal", "title slug")
    .sort({ createdAt: -1 })
    .lean();
  res.json(manuscripts);
});

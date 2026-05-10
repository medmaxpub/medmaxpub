import Journal from "../models/Journal.js";
import Video from "../models/Video.js";
import { buildAccessibleJournalFilter, ensureJournalAccess } from "../utils/accessControl.js";
import { uploadAsset } from "../utils/assetStorage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

export const createVideo = asyncHandler(async (req, res) => {
  const requestedJournalId = req.params.journalId || req.body.journalId;

  if (!requestedJournalId) {
    throw new AppError("Journal is required", 400);
  }

  const journal = await Journal.findById(requestedJournalId);

  if (!journal) {
    throw new AppError("Journal not found", 404);
  }

  ensureJournalAccess(req.user, journal._id);

  const thumbnail = await uploadAsset(req.files?.thumbnail?.[0], "medmaxpub/videos", "image", req);
  const videoFile = await uploadAsset(req.files?.videoFile?.[0], "medmaxpub/videos", "video", req);

  if (!req.body.youtubeUrl && !videoFile) {
    throw new AppError("Provide a YouTube embed URL or upload a video file", 400);
  }

  const video = await Video.create({
    journal: journal._id,
    title: req.body.title,
    description: req.body.description,
    youtubeUrl: req.body.youtubeUrl,
    thumbnail,
    videoFile
  });

  const populatedVideo = await Video.findById(video._id).populate("journal", "title slug").lean();
  res.status(201).json(populatedVideo);
});

export const getVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find().populate("journal", "title slug").sort({ createdAt: -1 }).lean();
  res.json(videos);
});

export const getAdminVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find(buildAccessibleJournalFilter(req.user))
    .populate("journal", "title slug")
    .sort({ createdAt: -1 })
    .lean();

  res.json(videos);
});

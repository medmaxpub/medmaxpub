import Issue from "../models/Issue.js";
import { ensureJournalAccess } from "../utils/accessControl.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createIssue = asyncHandler(async (req, res) => {
  const { journalId, volume, issue, year, isCurrent } = req.body;
  await ensureJournalAccess(req.user, journalId);

  if (isCurrent) {
    await Issue.updateMany({ journal: journalId }, { isCurrent: false });
  }

  const newIssue = await Issue.create({
    journal: journalId,
    volume,
    issue,
    year,
    isCurrent
  });

  res.status(201).json(newIssue);
});

export const getIssueArticlesGroup = asyncHandler(async (req, res, next) => {
  next();
});

import Article from "../models/Article.js";
import EditorialBoardMember from "../models/EditorialBoardMember.js";
import Issue from "../models/Issue.js";
import Journal from "../models/Journal.js";
import Ppt from "../models/Ppt.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import { decryptPassword } from "../utils/passwordVault.js";
import { ensureSuperAdmin, ensureUserAccess, normalizeRole } from "../utils/accessControl.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function serializeUser(user, journals = []) {
  const primaryJournal = journals[0] || null;

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.userName,
    role: normalizeRole(user.role),
    managingJournalName: primaryJournal?.managingJournalName || "",
    journalDomainName: primaryJournal?.journalDomainName || "",
    journalUrl: primaryJournal?.journalUrl || "",
    createdAt: user.createdAt,
    journalCount: journals.length,
    journals: journals.map((journal) => ({
      id: journal._id,
      managingJournalName: journal.managingJournalName,
      journalDomainName: journal.journalDomainName,
      journalUrl: journal.journalUrl,
      aboutJournal: journal.aboutJournal,
      journalInstructions: journal.journalInstructions,
      firstName: journal.firstName,
      lastName: journal.lastName
    }))
  };
}

function compareUsers(orderBy, direction) {
  const sortDirection = direction === "asc" ? 1 : -1;

  return (left, right) => {
    if (orderBy === "name") {
      const leftValue = `${left.firstName} ${left.lastName} ${left.username}`.trim().toLowerCase();
      const rightValue = `${right.firstName} ${right.lastName} ${right.username}`.trim().toLowerCase();
      return leftValue.localeCompare(rightValue) * sortDirection;
    }

    if (orderBy === "date") {
      const leftValue = new Date(left.createdAt || 0).getTime();
      const rightValue = new Date(right.createdAt || 0).getTime();
      return (leftValue - rightValue) * sortDirection;
    }

    return String(left.id).localeCompare(String(right.id)) * sortDirection;
  };
}

function applySuperUserFilters(items, query) {
  const search = String(query.search || query.q || "")
    .trim()
    .toLowerCase();
  const orderBy = ["id", "name", "date"].includes(String(query.orderBy || "").toLowerCase())
    ? String(query.orderBy).toLowerCase()
    : "date";
  const direction = String(query.direction || query.sort || "").toLowerCase() === "asc" ? "asc" : "desc";
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize, 10) || 10, 1), 100);

  const filtered = search
    ? items.filter((item) =>
        [item.username, item.managingJournalName, item.journalDomainName, item.journalUrl]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search))
      )
    : items;

  const sorted = [...filtered].sort(compareUsers(orderBy, direction));
  const total = sorted.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: sorted.slice(startIndex, startIndex + pageSize),
    meta: {
      total,
      page: currentPage,
      pageSize,
      totalPages,
      orderBy,
      direction,
      search
    }
  };
}

async function loadUsersWithJournals(filter = {}) {
  const users = await User.find(filter).sort({ createdAt: -1 }).lean();
  const journals = await Journal.find({ owner: { $in: users.map((user) => user._id) } }).sort({ createdAt: -1 }).lean();

  const journalsByOwner = new Map();
  journals.forEach((journal) => {
    const key = journal.owner.toString();
    const list = journalsByOwner.get(key) || [];
    list.push(journal);
    journalsByOwner.set(key, list);
  });

  return users.map((user) => serializeUser(user, journalsByOwner.get(user._id.toString()) || []));
}

export const getUsers = asyncHandler(async (req, res) => {
  if (normalizeRole(req.user.role) === "admin") {
    res.json(await loadUsersWithJournals({ role: { $nin: ["admin", "super_admin", "super_user"] } }));
    return;
  }

  res.json(await loadUsersWithJournals({ _id: req.user._id }));
});

export const getSuperUsers = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const items = await loadUsersWithJournals({ role: { $nin: ["admin", "super_admin", "super_user"] } });
  res.json(applySuperUserFilters(items, req.query));
});

export const createUser = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const firstName = normalizeText(req.body.firstName);
  const lastName = normalizeText(req.body.lastName);
  const username = normalizeText(req.body.username).toLowerCase();
  const password = normalizeText(req.body.password);

  if (!firstName || !lastName || !username || !password) {
    throw new AppError("First name, last name, username, and password are required", 400);
  }

  const existingUser = await User.findOne({ userName: username });

  if (existingUser) {
    throw new AppError("Username is already in use", 400);
  }

  const user = await User.create({
    firstName,
    lastName,
    userName: username,
    password,
    role: "user"
  });

  res.status(201).json(serializeUser(user, []));
});

export const updateUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  if (normalizeRole(targetUser.role) !== "user" && req.user._id.toString() !== targetUser._id.toString()) {
    throw new AppError("Privileged accounts cannot be edited from this module", 400);
  }

  ensureUserAccess(req.user, targetUser._id);

  const username = normalizeText(req.body.username).toLowerCase();
  const password = normalizeText(req.body.password);

  targetUser.firstName = normalizeText(req.body.firstName) || targetUser.firstName;
  targetUser.lastName = normalizeText(req.body.lastName) || targetUser.lastName;

  if (username && username !== targetUser.userName) {
    const existingUser = await User.findOne({ userName: username });

    if (existingUser && existingUser._id.toString() !== targetUser._id.toString()) {
      throw new AppError("Username is already in use", 400);
    }

    targetUser.userName = username;
  }

  if (password) {
    targetUser.password = password;
  }

  await targetUser.save();

  const journals = await Journal.find({ owner: targetUser._id }).lean();
  const fullNameUpdates = {
    firstName: targetUser.firstName,
    lastName: targetUser.lastName
  };

  await Promise.all(
    journals.map((journal) =>
      Journal.updateOne(
        { _id: journal._id },
        {
          $set: fullNameUpdates
        }
      )
    )
  );

  res.json(serializeUser(targetUser, journals.map((journal) => ({ ...journal, ...fullNameUpdates }))));
});

export const revealUserPassword = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  if (normalizeRole(targetUser.role) !== "user") {
    throw new AppError("Only user account passwords can be revealed", 400);
  }

  res.json({
    password: decryptPassword(targetUser.passwordEncrypted)
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  if (normalizeRole(targetUser.role) !== "user") {
    throw new AppError("Privileged accounts cannot be deleted from this module", 400);
  }

  const journals = await Journal.find({ owner: targetUser._id }).select("_id").lean();
  const journalIds = journals.map((journal) => journal._id);
  const issues = await Issue.find({ journal: { $in: journalIds } }).select("_id").lean();
  const issueIds = issues.map((issue) => issue._id);

  await Article.deleteMany({
    $or: [{ journal: { $in: journalIds } }, { issue: { $in: issueIds } }]
  });
  await EditorialBoardMember.deleteMany({ journal: { $in: journalIds } });
  await Issue.deleteMany({ _id: { $in: issueIds } });
  await Ppt.deleteMany({ journal: { $in: journalIds } });
  await Video.deleteMany({ journal: { $in: journalIds } });
  await Journal.deleteMany({ _id: { $in: journalIds } });
  await targetUser.deleteOne();

  res.status(204).send();
});

import Journal from "../models/Journal.js";
import { AppError } from "./appError.js";

export function normalizeRole(role) {
  const normalized = String(role || "")
    .trim()
    .toLowerCase();

  if (normalized === "super_admin" || normalized === "super_user" || normalized === "admin") {
    return "super_user";
  }

  return "user";
}

export function isAdmin(user) {
  return normalizeRole(user?.role) === "super_user";
}

export function isSuperUser(user) {
  return normalizeRole(user?.role) === "super_user";
}

export function hasElevatedAccess(user) {
  return normalizeRole(user?.role) === "super_user";
}

export function getAssignedJournalIds(user) {
  return (user?.assignedJournals || [])
    .map((journal) => {
      if (!journal) {
        return null;
      }

      if (typeof journal === "string") {
        return journal;
      }

      if (journal._id) {
        return journal._id.toString();
      }

      return journal.toString();
    })
    .filter(Boolean);
}

export function buildAccessibleJournalFilter(user, fieldName = "journal") {
  if (hasElevatedAccess(user)) {
    return {};
  }

  return {
    [fieldName]: { $in: getAssignedJournalIds(user) }
  };
}

export function ensureSuperAdmin(user) {
  if (!isSuperUser(user)) {
    throw new AppError("Super user access required", 403);
  }
}

export function ensureElevatedAccess(user) {
  if (!hasElevatedAccess(user)) {
    throw new AppError("Super user access required", 403);
  }
}

export async function ensureJournalAccess(user, journalId) {
  if (hasElevatedAccess(user)) {
    return;
  }

  const normalizedJournalId = journalId?.toString();

  if (normalizedJournalId && getAssignedJournalIds(user).includes(normalizedJournalId)) {
    return;
  }

  const journal = normalizedJournalId ? await Journal.findById(normalizedJournalId).select("owner").lean() : null;

  if (!journal || journal.owner?.toString() !== user?._id?.toString()) {
    throw new AppError("You do not have access to this journal", 403);
  }
}

export function ensureUserAccess(user, targetUserId) {
  if (hasElevatedAccess(user)) {
    return;
  }

  if (user?._id?.toString() !== targetUserId?.toString()) {
    throw new AppError("You do not have access to this user profile", 403);
  }
}

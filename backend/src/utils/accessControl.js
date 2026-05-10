import { AppError } from "./appError.js";

export function normalizeRole(role) {
  return role === "journal_admin" ? "journal_admin" : "super_admin";
}

export function isSuperAdmin(user) {
  return normalizeRole(user?.role) === "super_admin";
}

export function getAssignedJournalIds(user) {
  return (user?.assignedJournals || []).map((journal) => {
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
  }).filter(Boolean);
}

export function buildAccessibleJournalFilter(user, fieldName = "journal") {
  if (isSuperAdmin(user)) {
    return {};
  }

  return {
    [fieldName]: { $in: getAssignedJournalIds(user) }
  };
}

export function ensureSuperAdmin(user) {
  if (!isSuperAdmin(user)) {
    throw new AppError("Super admin access required", 403);
  }
}

export function ensureJournalAccess(user, journalId) {
  if (isSuperAdmin(user)) {
    return;
  }

  const normalizedJournalId = journalId?.toString();

  if (!normalizedJournalId || !getAssignedJournalIds(user).includes(normalizedJournalId)) {
    throw new AppError("You do not have access to this journal", 403);
  }
}

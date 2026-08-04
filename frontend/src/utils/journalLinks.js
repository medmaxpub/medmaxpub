function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractJournalValue(value) {
  const normalized = safeDecode(String(value || "").trim()).replace(/\\/g, "/");

  if (!normalized) {
    return "";
  }

  const withoutProtocol = normalized.replace(/^https?:\/+/i, "").replace(/^www\./i, "");
  const journalMatch = withoutProtocol.match(/(?:^|\/)journal\/([^/?#]+)/i);

  if (journalMatch?.[1]) {
    return journalMatch[1];
  }

  return withoutProtocol.split("/").filter(Boolean).pop() || withoutProtocol;
}

export function getJournalRouteSlug(value) {
  return extractJournalValue(value)
    .toLowerCase()
    .replace(/%20/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-?home-[a-z0-9-]+$/i, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildJournalSectionPath(journalUrl, section = "home") {
  const slug = getJournalRouteSlug(journalUrl);
  return slug ? `/journals/${slug}/${section}` : "/journals";
}

export function buildJournalArticleAbstractPath(journalUrl, articleId) {
  const slug = getJournalRouteSlug(journalUrl);
  return slug && articleId ? `/journals/${slug}/article-in-press/${articleId}/abstract` : "/journals";
}

// ✅ NEW: builds clean PDF viewer URL — no proxy name visible to the user
export function buildJournalArticlePdfPath(journalUrl, articleId) {
  const slug = getJournalRouteSlug(journalUrl);
  return slug && articleId ? `/journals/${slug}/article-in-press/${articleId}/pdf` : "/journals";
}

export function slugifyTitle(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildJournalArchiveIssuePath(journalUrl, year, volume, issueNumber) {
  const slug = getJournalRouteSlug(journalUrl);
  return slug && year && volume && issueNumber ? `/journals/${slug}/archive/${year}/${volume}/${issueNumber}` : "/journals";
}
// function safeDecode(value) {
//   try {
//     return decodeURIComponent(value);
//   } catch {
//     return value;
//   }
// }

// function extractJournalValue(value) {
//   const normalized = safeDecode(String(value || "").trim()).replace(/\\/g, "/");

//   if (!normalized) {
//     return "";
//   }

//   const withoutProtocol = normalized.replace(/^https?:\/+/i, "").replace(/^www\./i, "");
//   const journalMatch = withoutProtocol.match(/(?:^|\/)journal\/([^/?#]+)/i);

//   if (journalMatch?.[1]) {
//     return journalMatch[1];
//   }

//   return withoutProtocol.split("/").filter(Boolean).pop() || withoutProtocol;
// }

// export function getJournalRouteSlug(value) {
//   return extractJournalValue(value)
//     .toLowerCase()
//     .replace(/%20/g, "-")
//     .replace(/\s+/g, "-")
//     .replace(/-?home-[a-z0-9-]+$/i, "")
//     .replace(/[^a-z0-9-]+/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/^-|-$/g, "");
// }

// export function buildJournalSectionPath(journalUrl, section = "home") {
//   const slug = getJournalRouteSlug(journalUrl);
//   return slug ? `/journals/${slug}/${section}` : "/journals";
// }

// export function buildJournalArticleAbstractPath(journalUrl, articleId) {
//   const slug = getJournalRouteSlug(journalUrl);
//   return slug && articleId ? `/journals/${slug}/article-in-press/${articleId}/abstract` : "/journals";
// }

// export function buildJournalArchiveIssuePath(journalUrl, year, volume, issueNumber) {
//   const slug = getJournalRouteSlug(journalUrl);
//   return slug && year && volume && issueNumber ? `/journals/${slug}/archive/${year}/${volume}/${issueNumber}` : "/journals";
// }

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

// // ✅ NEW: builds clean PDF viewer URL — no proxy name visible to the user
// export function buildJournalArticlePdfPath(journalUrl, articleId) {
//   const slug = getJournalRouteSlug(journalUrl);
//   return slug && articleId ? `/journals/${slug}/article-in-press/${articleId}/pdf` : "/journals";
// }

// export function buildJournalArchiveIssuePath(journalUrl, year, volume, issueNumber) {
//   const slug = getJournalRouteSlug(journalUrl);
//   return slug && year && volume && issueNumber ? `/journals/${slug}/archive/${year}/${volume}/${issueNumber}` : "/journals";
// }
// // function safeDecode(value) {
// //   try {
// //     return decodeURIComponent(value);
// //   } catch {
// //     return value;
// //   }
// // }

// // function extractJournalValue(value) {
// //   const normalized = safeDecode(String(value || "").trim()).replace(/\\/g, "/");

// //   if (!normalized) {
// //     return "";
// //   }

// //   const withoutProtocol = normalized.replace(/^https?:\/+/i, "").replace(/^www\./i, "");
// //   const journalMatch = withoutProtocol.match(/(?:^|\/)journal\/([^/?#]+)/i);

// //   if (journalMatch?.[1]) {
// //     return journalMatch[1];
// //   }

// //   return withoutProtocol.split("/").filter(Boolean).pop() || withoutProtocol;
// // }

// // export function getJournalRouteSlug(value) {
// //   return extractJournalValue(value)
// //     .toLowerCase()
// //     .replace(/%20/g, "-")
// //     .replace(/\s+/g, "-")
// //     .replace(/-?home-[a-z0-9-]+$/i, "")
// //     .replace(/[^a-z0-9-]+/g, "-")
// //     .replace(/-+/g, "-")
// //     .replace(/^-|-$/g, "");
// // }

// // export function buildJournalSectionPath(journalUrl, section = "home") {
// //   const slug = getJournalRouteSlug(journalUrl);
// //   return slug ? `/journals/${slug}/${section}` : "/journals";
// // }

// // export function buildJournalArticleAbstractPath(journalUrl, articleId) {
// //   const slug = getJournalRouteSlug(journalUrl);
// //   return slug && articleId ? `/journals/${slug}/article-in-press/${articleId}/abstract` : "/journals";
// // }

// // export function buildJournalArchiveIssuePath(journalUrl, year, volume, issueNumber) {
// //   const slug = getJournalRouteSlug(journalUrl);
// //   return slug && year && volume && issueNumber ? `/journals/${slug}/archive/${year}/${volume}/${issueNumber}` : "/journals";
// // }
function safeDecode(value) {
  try { return decodeURIComponent(value); } catch { return value; }
}

function extractJournalValue(value) {
  const normalized = safeDecode(String(value || "").trim()).replace(/\\/g, "/");
  if (!normalized) return "";
  const withoutProtocol = normalized.replace(/^https?:\/+/i, "").replace(/^www\./i, "");
  const journalMatch = withoutProtocol.match(/(?:^|\/)journal\/([^/?#]+)/i);
  if (journalMatch?.[1]) return journalMatch[1];
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

// ✅ Converts article title to a clean URL slug
export function slugifyTitle(text) {
  return String(text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export function buildJournalSectionPath(journalUrl, section = "home") {
  const slug = getJournalRouteSlug(journalUrl);
  return slug ? `/journals/${slug}/${section}` : "/journals";
}

// ✅ Uses article title slug in URL instead of raw ID
export function buildJournalArticleAbstractPath(journalUrl, articleId, articleTitle) {
  const slug = getJournalRouteSlug(journalUrl);
  if (!slug) return "/journals";
  const titleSlug = articleTitle ? slugifyTitle(articleTitle) : null;
  const param = titleSlug || articleId;
  return `/journals/${slug}/article-in-press/${param}/abstract`;
}

// ✅ Uses article title slug in URL instead of raw ID
export function buildJournalArticlePdfPath(journalUrl, articleId, articleTitle) {
  const slug = getJournalRouteSlug(journalUrl);
  if (!slug) return "/journals";
  const titleSlug = articleTitle ? slugifyTitle(articleTitle) : null;
  const param = titleSlug || articleId;
  return `/journals/${slug}/article-in-press/${param}/pdf`;
}

export function buildJournalArchiveIssuePath(journalUrl, year, volume, issueNumber) {
  const slug = getJournalRouteSlug(journalUrl);
  return slug && year && volume && issueNumber
    ? `/journals/${slug}/archive/${year}/${volume}/${issueNumber}`
    : "/journals";
}
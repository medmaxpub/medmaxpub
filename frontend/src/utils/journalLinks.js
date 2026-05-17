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

export function buildJournalArchiveIssuePath(journalUrl, year, volume, issueNumber) {
  const slug = getJournalRouteSlug(journalUrl);
  return slug && year && volume && issueNumber ? `/journals/${slug}/archive/${year}/${volume}/${issueNumber}` : "/journals";
}

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

export function buildJournalSectionPath(journalUrl, section = "about") {
  const slug = getJournalRouteSlug(journalUrl);
  return slug ? `/journals/${slug}/${section}` : "/journals";
}

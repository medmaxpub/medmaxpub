function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function buildCurrentIssueLabel(currentIssue) {
  if (!currentIssue) {
    return "";
  }

  return `Vol. ${currentIssue.volume}, Issue ${currentIssue.issue} (${currentIssue.year})`;
}

export function buildJournalArchiveInfo(journal = {}) {
  const currentIssue = journal.currentIssue || null;
  const articles = currentIssue?.articles || [];
  const featuredArticle = articles[0] || null;
  const featuredAuthors = [...new Set(articles.flatMap((article) => article.authors || []))].slice(0, 6);
  const overview = stripHtml(journal.sections?.about || journal.sections?.home || journal.description || "");

  return {
    id: journal.id || journal._id,
    slug: journal.slug || "",
    title: journal.title || "Untitled journal",
    issn: journal.issn || "",
    category: journal.category || "",
    description: journal.description || "",
    overview,
    coverImageUrl: journal.coverImageUrl || journal.coverImage?.secure_url || "",
    currentIssueLabel: buildCurrentIssueLabel(currentIssue),
    featuredArticleTitle: featuredArticle?.title || "",
    featuredAuthors
  };
}

export function getAssetJournalSlug(item = {}) {
  return item.journalSlug || item.journal?.slug || "";
}

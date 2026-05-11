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
  const overview = stripHtml(journal.aboutJournal || "");

  return {
    id: journal.id || journal._id,
    journalUrl: journal.journalUrl || "",
    title: journal.managingJournalName || "Untitled journal",
    domainName: journal.journalDomainName || "",
    editorName: [journal.firstName, journal.lastName].filter(Boolean).join(" "),
    overview,
    currentIssueLabel: buildCurrentIssueLabel(currentIssue),
    featuredArticleTitle: featuredArticle?.title || "",
    featuredAuthors
  };
}

export function getAssetJournalUrl(item = {}) {
  return item.journalUrl || item.journal?.journalUrl || "";
}

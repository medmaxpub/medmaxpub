const SAMPLE_JOURNAL_URLS = new Set([
  "journal-global-clinical-translational-research",
  "open-journal-bioinformatics-intelligent-systems",
  "journal-sustainable-energy-engineering-policy",
  "international-journal-public-health-frontiers",
  "advances-in-digital-pharma-analytics",
  "journal-computational-materials-nano-systems"
]);

export function isSampleJournalUrl(value) {
  return SAMPLE_JOURNAL_URLS.has(String(value || "").trim().toLowerCase());
}

export function isSampleJournalRecord(journal) {
  return isSampleJournalUrl(journal?.journalUrl) || isSampleJournalUrl(journal?.slug);
}

export function filterSampleJournals(items = []) {
  return items.filter((item) => !isSampleJournalRecord(item));
}

export function filterSampleMediaItems(items = []) {
  return items.filter((item) => !isSampleJournalRecord(item?.journal));
}


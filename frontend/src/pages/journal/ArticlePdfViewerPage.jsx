import { ArrowLeft, Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import JournalMenu from "../../components/journal/JournalMenu";
import { mockJournals } from "../../data/mockData";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";
import { buildJournalArticleAbstractPath, getJournalRouteSlug } from "../../utils/journalLinks";

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findArticleInJournal(journal, articleId) {
  const inPressMatch = (journal?.inPressArticles || []).find(
    (item) => String(item.id) === String(articleId)
  );
  if (inPressMatch) return inPressMatch;

  const currentIssueMatch = (journal?.currentIssue?.articles || []).find(
    (item) => String(item.id) === String(articleId)
  );
  if (currentIssueMatch) return currentIssueMatch;

  for (const year of journal?.archive || []) {
    for (const volume of year.volumes || []) {
      for (const issue of volume.issues || []) {
        const archiveMatch = (issue.articles || []).find(
          (item) => String(item.id) === String(articleId)
        );
        if (archiveMatch) return archiveMatch;
      }
    }
  }

  return null;
}

export default function ArticlePdfViewerPage() {
  const { journalUrl, articleId } = useParams();
  const location = useLocation();
  const [journal, setJournal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournal = useCallback(async () => {
    setIsLoading(true);
    const data = await withFallback(
      () => cachedGet(`/journals/${journalUrl}`, {}, { ttlMs: 15000 }),
      useDevelopmentFallback
        ? mockJournals.find(
            (item) => getJournalRouteSlug(item.publicJournalUrl || item.journalUrl) === journalUrl
          )
        : null
    );
    setJournal(data);
    setIsLoading(false);
  }, [journalUrl, useDevelopmentFallback]);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  const article = useMemo(() => {
    // Use article passed via router state if available (avoids extra API call)
    if (location.state?.article && String(location.state.article.id) === String(articleId)) {
      return location.state.article;
    }
    return findArticleInJournal(journal, articleId);
  }, [articleId, journal, location.state]);

  const articleTitle = stripHtml(article?.title) || "Article PDF";

  // ✅ Set the browser tab title to the article name
  useEffect(() => {
    if (articleTitle) {
      document.title = `${articleTitle} | Medmax Publishers`;
    }
    return () => {
      document.title = "Medmax Publishers";
    };
  }, [articleTitle]);

  // ✅ The proxy URL is used ONLY inside the iframe — the user never sees it
  const iframeSrc = useMemo(() => {
    if (!article?.pdfUrl) return null;
    return buildPdfProxyUrl(article.pdfUrl, { filename: articleTitle });
  }, [article, articleTitle]);

  // ✅ Download URL forces a Save dialog with the article title as filename
  const downloadUrl = useMemo(() => {
    if (!article?.pdfUrl) return null;
    return buildPdfProxyUrl(article.pdfUrl, { filename: articleTitle, download: true });
  }, [article, articleTitle]);

  const abstractPath = buildJournalArticleAbstractPath(journalUrl, articleId);

  if (isLoading) return null;

  if (!article || !iframeSrc) {
    return (
      <div className="section-shell">
        <div className="container-shell">
          <EmptyState
            title="PDF not available"
            description="This article does not have a PDF attached yet."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell">
      <div className="container-shell space-y-6">
        {/* Journal navigation menu */}
        <div className="card-panel overflow-hidden">
          <div className="border-b border-brand-border px-5 py-5 sm:px-8 sm:py-6">
            <JournalMenu journalUrl={journal?.publicJournalUrl || journal?.journalUrl || journalUrl} />
          </div>

          <div className="p-5 sm:p-8">
            {/* Top bar: back button + download */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                to={abstractPath}
                state={location.state}
                className="button-secondary px-4 py-2"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Abstract
              </Link>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  className="button-primary px-4 py-2"
                  download
                >
                  <Download size={16} className="mr-2" />
                  Download PDF
                </a>
              )}
            </div>

            {/* Article title */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">
                {article.articleType || "Article"}
              </p>
              <h1 className="mt-2 font-display text-2xl font-semibold text-brand-ink sm:text-3xl">
                {articleTitle}
              </h1>
            </div>

            {/* ✅ PDF embedded in iframe — proxy URL is completely hidden from the address bar */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-brand-border shadow-sm">
              <iframe
                src={iframeSrc}
                title={articleTitle}
                className="h-[80vh] w-full border-0"
                loading="eager"
                allow="fullscreen"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

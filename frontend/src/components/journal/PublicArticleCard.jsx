import { FileText, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";
import { buildJournalArticleAbstractPath } from "../../utils/journalLinks";

function formatPublishedDate(value) {
  if (!value) {
    return "NA";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 10) || "NA";
  }

  return parsed.toISOString().slice(0, 10);
}

function resolveAuthorText(article) {
  if (article?.authorNames) {
    return article.authorNames;
  }

  if (Array.isArray(article?.authors) && article.authors.length) {
    return article.authors.join(", ");
  }

  return "NA";
}

export default function PublicArticleCard({ article, journalRoute, articleKey }) {
  return (
    <article key={articleKey || article.id} className="overflow-hidden rounded-3xl border border-cyan-500/60 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 bg-[linear-gradient(135deg,#0ea5b7_0%,#0891b2_100%)] px-5 py-1 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3c623] text-sm font-black lowercase text-brand-ink shadow-sm">
            doi
          </span>
          <span className="min-w-0 truncate rounded-md bg-white/20 px-3 py-1 text-sm font-semibold text-white md:text-base">
            {article.doiNumber || "NA"}
          </span>
        </div>
        <p className="text-lg font-semibold italic">{article.articleType || "Article"}</p>
      </div>

      <div className="space-y-5 p-5">
        <div className="text-sm text-brand-slate">
          <span className="font-semibold text-brand-ink">Title:</span>{" "}
          <span className="text-base font-medium text-brand-ink">{article.title || "Untitled article"}</span>
        </div>

        <div className="text-sm text-brand-slate">
          <span className="font-semibold text-brand-ink">Author:</span>{" "}
          <span>{resolveAuthorText(article)}</span>
        </div>

        <div className="text-sm text-brand-slate">
          <span className="font-semibold text-brand-ink">Publication Date:</span>{" "}
          <span>{formatPublishedDate(article.publishedDate)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={buildJournalArticleAbstractPath(journalRoute, article.id)}
            state={{ article }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-elevated text-brand-ink transition hover:border-brand-teal hover:bg-brand-sky"
            aria-label={`Open abstract for ${article.title || "article"}`}
            title="Open abstract"
          >
            <ScrollText size={18} />
          </Link>
          {article.pdfUrl ? (
            <a
              href={buildPdfProxyUrl(article.pdfUrl) || article.pdfUrl}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-elevated text-brand-ink transition hover:border-brand-teal hover:bg-brand-sky"
              target="_blank"
              rel="noreferrer"
              aria-label={`Open PDF for ${article.title || "article"}`}
              title="Open PDF in new tab"
            >
              <FileText size={18} />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

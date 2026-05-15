import { Download, ExternalLink, FileText, PlayCircle, ScrollText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import PptPreviewModal from "../../components/common/PptPreviewModal";
import JournalMenu from "../../components/journal/JournalMenu";
import IssueAccordion from "../../components/journal/IssueAccordion";
import { mockJournals } from "../../data/mockData";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { normalizePptItem, warmPreviewUrl } from "../../utils/pptPreview";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";
import { normalizeVideoItem } from "../../utils/videoPlayer";
import { buildJournalArticleAbstractPath, buildJournalSectionPath, getJournalRouteSlug } from "../../utils/journalLinks";

const sectionTitles = {
  home: "Home",
  about: "About Journal",
  "aim-scope": "Aim & Scope",
  "editorial-board": "Editorial Board",
  "author-guidelines": "Author Guidelines",
  "article-in-press": "Article in Press",
  "current-issue": "Current Issue",
  archive: "Archive"
};

function hasHtmlContent(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

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
  if (article.authorNames) {
    return article.authorNames;
  }

  if (Array.isArray(article.authors) && article.authors.length) {
    return article.authors.join(", ");
  }

  return "NA";
}

function renderCopyBlock(value, emptyState) {
  if (!String(value || "").trim()) {
    return emptyState || <EmptyState title="Content coming soon" description="This section has not been updated yet." />;
  }

  return (
    <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6 text-brand-slate">
      {hasHtmlContent(value) ? (
        <div className="rich-copy" dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        <p className="whitespace-pre-line leading-8">{value}</p>
      )}
    </div>
  );
}

export default function JournalShell() {
  const { journalUrl, section = "home" } = useParams();
  const [journal, setJournal] = useState(null);
  const [activePreview, setActivePreview] = useState(null);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournal = useCallback(() => {
    return withFallback(
      () => api.get(`/journals/${journalUrl}`),
      useDevelopmentFallback
        ? mockJournals.find((item) => getJournalRouteSlug(item.publicJournalUrl || item.journalUrl) === journalUrl)
        : null
    ).then(setJournal);
  }, [journalUrl, useDevelopmentFallback]);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  useAutoRefresh(loadJournal, { intervalMs: 15000 });

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActivePreview(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  if (!journal) {
    return (
      <div className="section-shell">
        <div className="container-shell">
          <EmptyState title="Journal not found" description="The selected journal record could not be loaded." />
        </div>
      </div>
    );
  }

  const journalVideos = (journal.videos || []).map(normalizeVideoItem);
  const journalRoute = journal.publicJournalUrl || journal.journalUrl;
  const homeContent = journal.homeContent || journal.aboutJournal;
  const aimScopeContent =
    journal.aimScope ||
    `This journal publishes peer-reviewed work in ${journal.journalDomainName || "its listed specialist fields"} with a focus on practical, scholarly, and translational value.`;
  const authorGuidelinesContent = journal.authorGuidelines || journal.journalInstructions;

  const renderArticleCard = (article, keyPrefix = "article") => (
    <article key={`${keyPrefix}-${article.id}`} className="overflow-hidden rounded-3xl border border-cyan-500/60 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 bg-[linear-gradient(135deg,#0ea5b7_0%,#0891b2_100%)] px-5 py-3 text-white">
        <p className="text-sm font-semibold md:text-base">DOI: {article.doiNumber || "NA"}</p>
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

  const renderHomeSection = () => (
    <div className="space-y-6">
      {renderCopyBlock(homeContent)}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link to={buildJournalSectionPath(journalRoute, "about")} className="rounded-3xl border border-brand-border bg-brand-surface p-5 transition hover:border-brand-teal hover:bg-brand-sky">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Overview</p>
          <h3 className="mt-3 text-xl font-semibold text-brand-ink">About</h3>
          <p className="mt-2 text-sm text-brand-slate">Read the journal background and publication profile.</p>
        </Link>
        <Link to={buildJournalSectionPath(journalRoute, "editorial-board")} className="rounded-3xl border border-brand-border bg-brand-surface p-5 transition hover:border-brand-teal hover:bg-brand-sky">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">People</p>
          <h3 className="mt-3 text-xl font-semibold text-brand-ink">Editorial Board</h3>
          <p className="mt-2 text-sm text-brand-slate">View the editor list maintained for this journal.</p>
        </Link>
        <Link to={buildJournalSectionPath(journalRoute, "article-in-press")} className="rounded-3xl border border-brand-border bg-brand-surface p-5 transition hover:border-brand-teal hover:bg-brand-sky">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Publishing</p>
          <h3 className="mt-3 text-xl font-semibold text-brand-ink">Article in Press</h3>
          <p className="mt-2 text-sm text-brand-slate">Open accepted articles before issue publication.</p>
        </Link>
        <Link to={buildJournalSectionPath(journalRoute, "archive")} className="rounded-3xl border border-brand-border bg-brand-surface p-5 transition hover:border-brand-teal hover:bg-brand-sky">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Collection</p>
          <h3 className="mt-3 text-xl font-semibold text-brand-ink">Archive</h3>
          <p className="mt-2 text-sm text-brand-slate">Browse previously published issues by year and volume.</p>
        </Link>
      </div>

      {journal.pdfFiles?.length || journal.ppts?.length || journalVideos.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Journal PDFs</p>
            <h3 className="mt-3 text-xl font-semibold text-brand-ink">{journal.pdfFiles?.length || 0} files</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {(journal.pdfFiles || []).slice(0, 2).map((pdf) => (
                <a
                  key={pdf.id}
                  href={buildPdfProxyUrl(pdf.fileUrl) || pdf.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button-soft px-4 py-2"
                >
                  <FileText size={16} className="mr-2" />
                  {pdf.title}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Journal PPTs</p>
            <h3 className="mt-3 text-xl font-semibold text-brand-ink">{journal.ppts?.length || 0} presentations</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {(journal.ppts || []).slice(0, 2).map((ppt) => (
                <button
                  key={ppt.id}
                  type="button"
                  className="button-soft px-4 py-2"
                  onMouseEnter={() => {
                    const normalized = normalizePptItem(ppt);
                    warmPreviewUrl(normalized.previewUrl);
                  }}
                  onFocus={() => {
                    const normalized = normalizePptItem(ppt);
                    warmPreviewUrl(normalized.previewUrl);
                  }}
                  onClick={() => setActivePreview(normalizePptItem(ppt))}
                >
                  <FileText size={16} className="mr-2" />
                  {ppt.title}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Journal Videos</p>
            <h3 className="mt-3 text-xl font-semibold text-brand-ink">{journalVideos.length} videos</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {journalVideos.slice(0, 1).map((video) => (
                <a
                  key={video.id}
                  href={video.youtubeUrl || video.videoUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="button-soft px-4 py-2"
                  aria-disabled={!video.youtubeUrl && !video.videoUrl}
                >
                  <PlayCircle size={16} className="mr-2" />
                  {video.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderCurrentIssue = () => (
    <div className="space-y-4">
      {journal.currentIssue ? (
        <>
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Issue Information</p>
            <h3 className="mt-2 text-2xl font-semibold text-brand-ink">
              Volume {journal.currentIssue.volume}, Issue {journal.currentIssue.issue} ({journal.currentIssue.year})
            </h3>
          </div>
          {journal.currentIssue.articles.map((article) => (
            <article key={article.id} className="rounded-3xl border border-brand-border bg-brand-surface p-5">
              <h4 className="text-xl font-semibold text-brand-ink">{article.title}</h4>
              <p className="mt-2 text-sm text-brand-slate">{article.authors.join(", ")}</p>
              <div className="mt-4 flex gap-3">
                <a href={buildPdfProxyUrl(article.pdfUrl) || article.pdfUrl} className="button-soft px-4 py-2" target="_blank" rel="noreferrer">
                  <ExternalLink size={16} className="mr-2" />
                  View PDF
                </a>
                <a href={buildPdfProxyUrl(article.pdfUrl, { download: true }) || article.pdfUrl} className="button-primary px-4 py-2" target="_blank" rel="noreferrer">
                  <Download size={16} className="mr-2" />
                  Download PDF
                </a>
              </div>
            </article>
          ))}
        </>
      ) : (
        <EmptyState
          title="No current issue available"
          description="Create an issue and attach articles from the admin dashboard to populate this section."
        />
      )}
    </div>
  );

  const renderSection = () => {
    if (section === "home") {
      return renderHomeSection();
    }

    if (section === "about") {
      return renderCopyBlock(journal.aboutJournal);
    }

    if (section === "aim-scope") {
      return renderCopyBlock(aimScopeContent);
    }

    if (section === "editorial-board") {
      const editorialBoard = journal.editorialBoard || [];

      if (!editorialBoard.length) {
        return (
          <EmptyState
            title="Editorial board not available"
            description="The journal admin has not published editorial board members for this journal yet."
          />
        );
      }

      return (
        <div className="grid gap-6 lg:grid-cols-2">
          {editorialBoard.map((member) => (
            <article key={member.id} className="rounded-3xl border border-brand-border bg-brand-surface p-5">
              <div className="flex gap-4">
                {member.profileImageUrl ? (
                  <img src={member.profileImageUrl} alt={member.name} className="h-24 w-20 rounded-2xl border border-brand-border object-cover" />
                ) : (
                  <div className="flex h-24 w-20 items-center justify-center rounded-2xl border border-brand-border bg-brand-elevated text-xs font-semibold text-brand-slate">
                    {member.editorType || "Editor"}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">{member.editorType || "Editorial Board"}</p>
                  <h3 className="mt-2 text-xl font-semibold text-brand-ink">{member.name}</h3>
                  {member.designation ? <p className="mt-1 text-sm text-brand-slate">{member.designation}</p> : null}
                  {member.department ? <p className="mt-1 text-sm text-brand-slate">{member.department}</p> : null}
                  {member.country ? <p className="mt-1 text-sm text-brand-slate">{member.country}</p> : null}
                </div>
              </div>
              {member.editorDescription ? <p className="mt-4 leading-7 text-brand-slate">{member.editorDescription}</p> : null}
              {member.editorBiography ? <p className="mt-4 leading-7 text-brand-slate">{member.editorBiography}</p> : null}
              {member.profileUrl ? (
                <a href={member.profileUrl} target="_blank" rel="noreferrer" className="button-soft mt-4 px-4 py-2">
                  <ExternalLink size={16} className="mr-2" />
                  View Profile
                </a>
              ) : null}
            </article>
          ))}
        </div>
      );
    }

    if (section === "author-guidelines") {
      return renderCopyBlock(authorGuidelinesContent);
    }

    if (section === "article-in-press") {
      const inPressArticles = journal.inPressArticles || [];

      if (!inPressArticles.length) {
        return (
          <EmptyState
            title="No articles in press available"
            description="Accepted articles will appear here once the journal admin publishes them as in-press records."
          />
        );
      }

      return <div className="space-y-4">{inPressArticles.map((article) => renderArticleCard(article, "inpress"))}</div>;
    }

    if (section === "current-issue") {
      return renderCurrentIssue();
    }

    if (section === "archive") {
      return <IssueAccordion archive={journal.archive} />;
    }

    return renderCopyBlock(journal.aboutJournal);
  };

  return (
    <div className="section-shell">
      <div className="container-shell">
        <div className="card-panel overflow-hidden">
          <div className="border-b border-brand-border px-5 py-5 sm:px-8 sm:py-6">
            <JournalMenu journalUrl={journal.publicJournalUrl || journal.journalUrl} />
          </div>
          <div className="grid gap-6 px-5 py-5 sm:px-8 sm:py-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
            <div className="flex min-h-[368px] items-center justify-center">
              {journal.coverImage ? (
                <img
                  src={journal.coverImage}
                  alt={`${journal.managingJournalName} cover`}
                  className="h-full min-h-[368px] w-full rounded-3xl object-contain"
                />
              ) : (
                <div className="flex h-full min-h-[368px] w-full items-center justify-center rounded-3xl bg-brand-surface p-4 text-center text-sm font-semibold text-brand-slate">
                  Journal Cover
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-brand-border bg-brand-surface p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Managing Journal Name</p>
              <h1 className="mt-3 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">{journal.managingJournalName}</h1>
              <p className="mt-4 text-sm text-brand-slate">Managed by {journal.firstName} {journal.lastName}</p>
              {journal.pdfFiles?.length ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {journal.pdfFiles.map((item) => (
                    <a
                      key={item.id}
                      href={buildPdfProxyUrl(item.fileUrl) || item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary inline-flex px-4 py-2"
                    >
                      <FileText size={16} className="mr-2" />
                      View PDF
                    </a>
                  ))}
                </div>
              ) : journal.pdfFileUrl ? (
                <a href={buildPdfProxyUrl(journal.pdfFileUrl) || journal.pdfFileUrl} target="_blank" rel="noreferrer" className="button-secondary mt-5 inline-flex px-4 py-2">
                  <FileText size={16} className="mr-2" />
                  View PDF
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 card-panel p-5 sm:p-8">
          <span className="eyebrow">{sectionTitles[section] || "Journal"}</span>
          {section !== "article-in-press" ? (
            <h2 className="font-display text-2xl font-semibold text-brand-ink sm:text-3xl">{sectionTitles[section] || "Journal Section"}</h2>
          ) : null}
          <div className="mt-6">{renderSection()}</div>
        </div>
      </div>
      <PptPreviewModal ppt={activePreview} onClose={() => setActivePreview(null)} />
    </div>
  );
}

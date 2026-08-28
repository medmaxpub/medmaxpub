import { Building2, Crown, ExternalLink, FileText, MapPin, PlayCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import IssueAccordion from "../../components/journal/IssueAccordion";
import PublicArticleCard from "../../components/journal/PublicArticleCard";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { mockJournals } from "../../data/mockData";
import { buildPptViewPath, normalizePptItem, warmPreviewUrl } from "../../utils/pptPreview";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";
import { normalizeVideoItem } from "../../utils/videoPlayer";
import { buildJournalSectionPath, getJournalRouteSlug } from "../../utils/journalLinks";

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
  const [isLoading, setIsLoading] = useState(true);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournal = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }

    const data = await withFallback(
      () => cachedGet(`/journals/${journalUrl}`, {}, { ttlMs: 15000 }),
      useDevelopmentFallback
        ? mockJournals.find((item) => getJournalRouteSlug(item.publicJournalUrl || item.journalUrl) === journalUrl)
        : null
    );

    if (data || !silent) {
      setJournal(data);
    }

    if (!silent) {
      setIsLoading(false);
    }
  }, [journalUrl, useDevelopmentFallback]);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  useAutoRefresh(() => loadJournal({ silent: true }), {
    enabled: !useDevelopmentFallback,
    intervalMs: 0
  });

  if (isLoading) {
    return null;
  }

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
  const showJournalHero = section === "home" || section === "about" || section === "aim-scope";
  const aimScopeContent =
    journal.aimScope ||
    `This journal publishes peer-reviewed work in ${journal.journalDomainName || "its listed specialist fields"} with a focus on practical, scholarly, and translational value.`;
  const authorGuidelinesContent = journal.authorGuidelines || journal.journalInstructions;

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
              {(journal.ppts || []).slice(0, 2).map((ppt) => {
                const normalized = normalizePptItem(ppt);

                return (
                  <Link
                    key={ppt.id}
                    to={buildPptViewPath(normalized)}
                    className="button-soft px-4 py-2"
                    onMouseEnter={() => warmPreviewUrl(normalized.officeViewerPageUrl || normalized.previewUrl)}
                    onFocus={() => warmPreviewUrl(normalized.officeViewerPageUrl || normalized.previewUrl)}
                  >
                    <FileText size={16} className="mr-2" />
                    {ppt.title}
                  </Link>
                );
              })}
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
    <div className="space-y-3">
      {journal.currentIssue ? (
        <>
          {journal.currentIssue.articles.map((article) => (
            <PublicArticleCard key={article.id} article={article} journalRoute={journalRoute} articleKey={`current-${article.id}`} />
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

      const isChiefEditor = (member) => /chief/i.test(member.editorType || "");
      const chiefEditors = editorialBoard.filter(isChiefEditor);
      const boardMembers = editorialBoard.filter((member) => !isChiefEditor(member));

      const renderBio = (member) => {
        const text = member.editorDescription || member.editorBiography;
        if (!text) return null;
        return hasHtmlContent(text) ? (
          <div className="rich-copy mt-3 text-sm leading-6 text-slate-500" dangerouslySetInnerHTML={{ __html: text }} />
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
        );
      };

      const renderChiefCard = (member) => (
        <article key={member.id} className="rounded-2xl border border-slate-200 bg-white px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="shrink-0">
              {member.profileImageUrl ? (
                <img
                  src={member.profileImageUrl}
                  alt={member.name}
                  className="h-28 w-28 rounded-full border border-slate-200 object-cover sm:h-32 sm:w-32"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-2xl font-semibold text-brand-navy sm:h-32 sm:w-32">
                  {(member.name || "E").charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/40 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">
                <Crown size={13} />
                Editor-in-Chief
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-slate-900 sm:text-3xl">{member.name}</h3>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-500 sm:justify-start">
                {member.designation ? <span>{member.designation}</span> : null}
                {member.department ? (
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={13} />
                    {member.department}
                  </span>
                ) : null}
                {member.country ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} />
                    {member.country}
                  </span>
                ) : null}
              </div>

              {(member.editorDescription || member.editorBiography) ? (
                hasHtmlContent(member.editorDescription || member.editorBiography) ? (
                  <div
                    className="rich-copy mt-4 text-sm leading-6 text-slate-500"
                    dangerouslySetInnerHTML={{ __html: member.editorDescription || member.editorBiography }}
                  />
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-500">{member.editorDescription || member.editorBiography}</p>
                )
              ) : null}

              {member.profileUrl ? (
                <a
                  href={member.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-navy hover:text-brand-navy"
                >
                  <ExternalLink size={13} />
                  View Full Profile
                </a>
              ) : null}
            </div>
          </div>
        </article>
      );

      const renderMemberCard = (member) => (
        <article
          key={member.id}
          className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-navy/30"
        >
          <div className="flex items-start gap-3.5">
            {member.profileImageUrl ? (
              <img
                src={member.profileImageUrl}
                alt={member.name}
                className="h-16 w-16 shrink-0 rounded-2xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg font-semibold text-brand-navy">
                {(member.name || "E").charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                <Sparkles size={11} />
                {member.editorType || "Editorial Board"}
              </span>
              <h3 className="mt-1.5 truncate font-display text-base font-semibold text-slate-900">{member.name}</h3>
              {member.designation ? <p className="truncate text-xs text-slate-500">{member.designation}</p> : null}
            </div>
          </div>

          {(member.department || member.country) ? (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
              {member.department ? (
                <span className="inline-flex items-center gap-1">
                  <Building2 size={12} />
                  {member.department}
                </span>
              ) : null}
              {member.country ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} />
                  {member.country}
                </span>
              ) : null}
            </div>
          ) : null}

          {renderBio(member)}

          {member.profileUrl ? (
            <a
              href={member.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-navy hover:text-brand-navy"
            >
              <ExternalLink size={13} />
              View Profile
            </a>
          ) : null}
        </article>
      );

      return (
        <div className="space-y-10">
          {chiefEditors.length ? <div className="space-y-4">{chiefEditors.map((member) => renderChiefCard(member))}</div> : null}

          {boardMembers.length ? (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Editorial Board</p>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{boardMembers.map((member) => renderMemberCard(member))}</div>
            </div>
          ) : null}
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

      return (
        <div className="space-y-3">
          {inPressArticles.map((article) => (
            <PublicArticleCard key={article.id} article={article} journalRoute={journalRoute} articleKey={`inpress-${article.id}`} />
          ))}
        </div>
      );
    }

    if (section === "current-issue") {
      return renderCurrentIssue();
    }

    if (section === "archive") {
      return <IssueAccordion archive={journal.archive} journalUrl={journalRoute} />;
    }

    return renderCopyBlock(journal.aboutJournal);
  };

  return (
    <div className="section-shell pt-0 sm:pt-0 lg:pt-0">
      <div className="container-shell">
        <div className="card-panel overflow-hidden">
          {showJournalHero ? (
            <div className="grid gap-6 px-5 py-5 sm:px-8 sm:py-8 lg:grid-cols-[0.48fr_1.52fr] lg:gap-8">
              <div className="flex min-h-[184px] items-center justify-center">
                {journal.coverImage ? (
                  <img
                    src={journal.coverImage}
                    alt={`${journal.managingJournalName} cover`}
                    className="h-full min-h-[184px] w-full rounded-3xl object-contain"
                  />
                ) : (
                  <div className="flex h-full min-h-[184px] w-full items-center justify-center rounded-3xl bg-brand-surface p-4 text-center text-sm font-semibold text-brand-slate">
                    Journal Cover
                  </div>
                )}
              </div>
              <div className="rounded-3xl border border-brand-border bg-brand-surface p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Managing Journal Name</p>
                <h1 className="mt-3 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">{journal.managingJournalName}</h1>
                {journal.issn ? <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-brand-gold">ISSN: {journal.issn}</p> : null}
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
          ) : null}
        </div>

        <div className="mt-5 card-panel p-5 sm:mt-6 sm:p-8">
          <span className="eyebrow">{sectionTitles[section] || "Journal"}</span>
          {section !== "article-in-press" ? (
            <h2 className="font-display text-2xl font-semibold text-brand-ink sm:text-3xl">{sectionTitles[section] || "Journal Section"}</h2>
          ) : null}
          <div className="mt-6">{renderSection()}</div>
        </div>
      </div>
    </div>
  );
}
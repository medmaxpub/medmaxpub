import { Download, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import PptPreviewModal from "../../components/common/PptPreviewModal";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals, mockPpts } from "../../data/mockData";
import { buildJournalArchiveInfo, getAssetJournalUrl } from "../../utils/journalArchive";
import { buildJournalSectionPath } from "../../utils/journalLinks";
import { normalizePptItem } from "../../utils/pptPreview";

export default function PptsPage() {
  const [items, setItems] = useState([]);
  const [activePreview, setActivePreview] = useState(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  useEffect(() => {
    let ignore = false;

    const loadItems = async () => {
      setIsLoading(true);
      const data = await withFallback(() => api.get("/ppts"), useDevelopmentFallback ? mockPpts : []);
      const normalized = data.map(normalizePptItem);
      const journalLookup = {};

      if (useDevelopmentFallback) {
        mockJournals.forEach((journal) => {
          journalLookup[journal.journalUrl] = buildJournalArchiveInfo(journal);
        });
      } else {
        const journalUrls = [...new Set(normalized.map(getAssetJournalUrl).filter(Boolean))];
        const journalResults = await Promise.all(
          journalUrls.map(async (url) => {
            const journal = await withFallback(() => api.get(`/journals/${url}`), null);
            return journal ? [url, buildJournalArchiveInfo(journal)] : null;
          })
        );

        journalResults.filter(Boolean).forEach(([url, journal]) => {
          journalLookup[url] = journal;
        });
      }

      if (!ignore) {
        setItems(
          normalized.map((item) => ({
            ...item,
            journalInfo: journalLookup[getAssetJournalUrl(item)] || null
          }))
        );
        setIsLoading(false);
      }
    };

    loadItems();
    return () => {
      ignore = true;
    };
  }, [useDevelopmentFallback]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActivePreview(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const filteredItems = items.filter((ppt) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return [
      ppt.title,
      ppt.description,
      ppt.journalTitle,
      ppt.journalInfo?.title,
      ppt.journalInfo?.overview,
      ppt.journalInfo?.featuredArticleTitle,
      (ppt.journalInfo?.featuredAuthors || []).join(" ")
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  const journalCount = new Set(items.map((ppt) => ppt.journalInfo?.journalUrl || ppt.journalUrl).filter(Boolean)).size;

  return (
    <div className="section-shell">
      <div className="container-shell">
        <SectionHeader
          label="PPT Archive"
          title="Presentation resources linked to journal records"
          description="Browse all public PPT entries in an archive-style listing with journal details, issue context, preview access, and downloads."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="card-panel p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Total PPTs</p>
            <p className="mt-2 font-display text-4xl font-semibold text-brand-ink">{items.length}</p>
          </div>
          <div className="card-panel p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Linked Journals</p>
            <p className="mt-2 font-display text-4xl font-semibold text-brand-ink">{journalCount}</p>
          </div>
          <div className="card-panel p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Downloads</p>
            <p className="mt-2 text-sm leading-7 text-brand-slate">Each record keeps preview and download actions grouped with the source journal.</p>
          </div>
        </div>

        <div className="mt-8 card-panel p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Search size={18} className="text-brand-slate" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search PPT titles, journal names, authors, or archive details"
              className="border-none bg-transparent p-0 shadow-none focus:ring-0"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10">
            <EmptyState title="Loading PPT archive" description="Public presentation records are being prepared." />
          </div>
        ) : filteredItems.length ? (
          <div className="mt-10 space-y-6">
            {filteredItems.map((ppt) => (
              <article key={ppt.id} className="card-panel overflow-hidden">
                <div className="grid lg:grid-cols-[280px_1fr]">
                  <div className="flex min-h-64 items-center justify-center bg-brand-elevated px-8 text-center">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Related Journal</p>
                      <h3 className="mt-3 font-display text-2xl font-semibold text-brand-ink">
                        {ppt.journalInfo?.title || ppt.journalTitle || "Journal details unavailable"}
                      </h3>
                      {ppt.journalInfo?.domainName ? <p className="mt-2 text-sm text-brand-slate">{ppt.journalInfo.domainName}</p> : null}
                    </div>
                  </div>
                  <div className="p-5 sm:p-7">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="eyebrow mb-0">PPT Record</span>
                      <p className="text-brand-slate">Uploaded {new Date(ppt.uploadedDate).toLocaleDateString()}</p>
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-semibold text-brand-ink">{ppt.title}</h2>
                    <p className="mt-4 leading-7 text-brand-slate">{ppt.description}</p>

                    <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.95fr]">
                      <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Actions</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button type="button" className="button-soft px-4 py-2" onClick={() => setActivePreview(ppt)}>
                            <Eye size={16} className="mr-2" />
                            Preview
                          </button>
                          <a href={ppt.downloadUrl} target="_blank" rel="noreferrer" download className="button-primary px-4 py-2">
                            <Download size={16} className="mr-2" />
                            Download PPT
                          </a>
                          {ppt.journalInfo?.journalUrl ? (
                            <Link
                              to={buildJournalSectionPath(ppt.journalInfo.publicJournalUrl || ppt.journalInfo.journalUrl, "about")}
                              className="button-secondary px-4 py-2"
                            >
                              Open Journal
                            </Link>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-brand-border bg-brand-surface p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Related Journal</p>
                        <h3 className="mt-3 font-display text-2xl font-semibold text-brand-ink">
                          {ppt.journalInfo?.title || ppt.journalTitle || "Journal details unavailable"}
                        </h3>
                        {ppt.journalInfo?.domainName ? <p className="mt-2 text-sm text-brand-slate">{ppt.journalInfo.domainName}</p> : null}
                        {ppt.journalInfo?.editorName ? <p className="mt-1 text-sm text-brand-slate">Managed by {ppt.journalInfo.editorName}</p> : null}
                        {ppt.journalInfo?.overview ? (
                          <>
                            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-brand-teal">Abstract / Overview</p>
                            <p className="mt-2 text-sm leading-7 text-brand-slate">{ppt.journalInfo.overview}</p>
                          </>
                        ) : null}
                        {ppt.journalInfo?.featuredAuthors?.length ? (
                          <p className="mt-4 text-sm text-brand-slate">
                            <span className="font-semibold text-brand-ink">Authors:</span> {ppt.journalInfo.featuredAuthors.join(", ")}
                          </p>
                        ) : null}
                        {ppt.journalInfo?.featuredArticleTitle ? (
                          <p className="mt-2 text-sm text-brand-slate">
                            <span className="font-semibold text-brand-ink">Current article:</span> {ppt.journalInfo.featuredArticleTitle}
                          </p>
                        ) : null}
                        {ppt.journalInfo?.currentIssueLabel ? (
                          <p className="mt-2 text-sm text-brand-slate">
                            <span className="font-semibold text-brand-ink">Current issue:</span> {ppt.journalInfo.currentIssueLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title="No PPT records matched this search"
              description="Try a broader journal title, author name, or presentation keyword."
            />
          </div>
        )}
      </div>

      <PptPreviewModal ppt={activePreview} onClose={() => setActivePreview(null)} />
    </div>
  );
}

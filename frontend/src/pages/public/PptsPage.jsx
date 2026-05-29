import { ExternalLink, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals, mockPpts } from "../../data/mockData";
import { buildJournalArchiveInfo, getAssetJournalUrl } from "../../utils/journalArchive";
import { buildPptViewPath, normalizePptItem, warmPreviewUrl } from "../../utils/pptPreview";

export default function PptsPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    if (useDevelopmentFallback) {
      const journalLookup = {};

      mockJournals.forEach((journal) => {
        journalLookup[journal.journalUrl] = buildJournalArchiveInfo(journal);
      });

      setItems(
        mockPpts.map(normalizePptItem).map((item) => ({
          ...item,
          journalInfo: journalLookup[getAssetJournalUrl(item)] || null
        }))
      );
      setIsLoading(false);
      return;
    }

    const [journalSummaries, pptRecords] = await Promise.all([
      withFallback(() => cachedGet("/journals"), []),
      withFallback(() => cachedGet("/ppts"), [])
    ]);

    const journalLookup = new Map(
      (Array.isArray(journalSummaries) ? journalSummaries : []).map((journal) => [
        journal.publicJournalUrl || journal.journalUrl,
        buildJournalArchiveInfo(journal)
      ])
    );

    const liveItems = (Array.isArray(pptRecords) ? pptRecords : []).map((ppt) => {
      const normalizedItem = normalizePptItem(ppt);
      const journalInfo =
        buildJournalArchiveInfo(ppt.journal || {}) ||
        journalLookup.get(normalizedItem.publicJournalUrl || normalizedItem.journalUrl) ||
        null;

      return {
        ...normalizedItem,
        journalInfo:
          journalLookup.get(normalizedItem.publicJournalUrl || normalizedItem.journalUrl) ||
          journalInfo
      };
    });

    setItems(liveItems);
    setIsLoading(false);
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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

  return (
    <div className="section-shell">
      <div className="container-shell">
        <SectionHeader
          label="PPT Archive"
          title="PPT Presentations"
          description="Browse PPT records by journal and presentation title."
        />

        <div className="mt-8 card-panel p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Search size={18} className="text-brand-slate" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search PPT title or journal name"
              className="border-none bg-transparent p-0 shadow-none focus:ring-0"
            />
          </div>
        </div>

        {isLoading ? null : filteredItems.length ? (
          <div className="mt-10 space-y-6">
            {filteredItems.map((ppt) => (
              <Link
                key={ppt.id}
                to={buildPptViewPath(ppt)}
                className="card-panel block overflow-hidden transition hover:-translate-y-0.5 hover:border-brand-navy/20 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
                onMouseEnter={() => warmPreviewUrl(ppt.officeViewerPageUrl || ppt.previewUrl || ppt.browserPreviewUrl)}
                onFocus={() => warmPreviewUrl(ppt.officeViewerPageUrl || ppt.previewUrl || ppt.browserPreviewUrl)}
              >
                <div className="grid gap-5 p-5 sm:grid-cols-[250px_1fr] sm:p-6">
                  <div className="overflow-hidden rounded-3xl border border-brand-border bg-brand-elevated">
                    {ppt.coverImageUrl ? (
                      <img
                        src={ppt.coverImageUrl}
                        alt={ppt.title}
                        className="h-44 w-full object-cover sm:h-40"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center px-6 text-center sm:h-40">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">PPT Cover</p>
                          <p className="mt-3 text-sm text-brand-slate">Cover image unavailable</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 self-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">
                      {ppt.journalInfo?.title || ppt.journalTitle || "Journal details unavailable"}
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-brand-ink sm:text-3xl">
                      {ppt.title}
                    </h2>
                    {(ppt.browserPreviewUrl || ppt.downloadUrl) ? (
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-slate">
                        <ExternalLink size={15} className="text-brand-crimson" />
                        Open PPT Page
                      </div>
                    ) : null}
                    {ppt.previewIssue ? <p className="mt-3 text-sm text-rose-500">{ppt.previewIssue}</p> : null}
                  </div>
                </div>
              </Link>
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
    </div>
  );
}

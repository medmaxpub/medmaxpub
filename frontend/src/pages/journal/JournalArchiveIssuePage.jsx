import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import JournalMenu from "../../components/journal/JournalMenu";
import PublicArticleCard from "../../components/journal/PublicArticleCard";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { mockJournals } from "../../data/mockData";
import {
  buildJournalSectionPath,
  getJournalRouteSlug
} from "../../utils/journalLinks";

function resolveArchiveIssue(journal, year, volume, issueNumber) {
  const matchingYear = (journal?.archive || []).find((item) => String(item.year) === String(year));

  if (!matchingYear) {
    return null;
  }

  for (const volumeBlock of matchingYear.volumes || []) {
    for (const issue of volumeBlock.issues || []) {
      if (String(volumeBlock.volume) === String(volume) && String(issue.issue) === String(issueNumber)) {
        return {
          ...issue,
          year: matchingYear.year,
          volume: volumeBlock.volume
        };
      }
    }
  }

  return null;
}

export default function JournalArchiveIssuePage() {
  const { journalUrl, year, volume, issueNumber } = useParams();
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

  const archiveIssue = useMemo(() => resolveArchiveIssue(journal, year, volume, issueNumber), [journal, year, volume, issueNumber]);

  if (isLoading) {
    return (
      <div className="section-shell">
        <div className="container-shell">
          <EmptyState title="Loading archive issue" description="The selected archive issue is being prepared." />
        </div>
      </div>
    );
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

  if (!archiveIssue) {
    return (
      <div className="section-shell">
        <div className="container-shell">
          <EmptyState title="Archive issue not found" description="The selected volume and issue could not be found for this journal." />
        </div>
      </div>
    );
  }

  const journalRoute = journal.publicJournalUrl || journal.journalUrl;

  return (
    <div className="section-shell">
      <div className="container-shell space-y-8">
        <div className="card-panel overflow-hidden">
          <div className="border-b border-brand-border px-5 py-5 sm:px-8 sm:py-6">
            <JournalMenu journalUrl={journalRoute} />
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Link to={buildJournalSectionPath(journalRoute, "archive")} className="button-secondary px-4 py-2">
                <ArrowLeft size={16} className="mr-2" />
                Back to Archive
              </Link>
            </div>

            <div className="mt-8 rounded-3xl border border-brand-border bg-brand-surface p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Archive Issue</p>
              <h1 className="mt-3 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">
                Volume {archiveIssue.volume}, Issue {archiveIssue.issue}
              </h1>
              <p className="mt-3 text-sm text-brand-slate">
                Archive year {archiveIssue.year}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {archiveIssue.articles.length ? (
                archiveIssue.articles.map((article) => (
                  <PublicArticleCard key={article.id} article={article} journalRoute={journalRoute} articleKey={`archive-${article.id}`} />
                ))
              ) : (
                <EmptyState
                  title="No articles in this archive issue"
                  description="Articles for this archive issue will appear here once they are attached."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

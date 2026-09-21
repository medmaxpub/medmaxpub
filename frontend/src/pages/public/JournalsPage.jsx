import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cachedGet, shouldUseDevelopmentFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import JournalCard from "../../components/common/JournalCard";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals } from "../../data/mockData";

function JournalsSkeleton() {
  return (
    <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="card-panel h-full overflow-hidden p-0">
          <div className="aspect-[4/5] bg-brand-border" />
          <div className="flex flex-col gap-3 p-5">
            <div className="h-4 w-full rounded bg-brand-border" />
            <div className="h-4 w-2/3 rounded bg-brand-border" />
            <div className="h-3 w-1/3 rounded bg-brand-border" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JournalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [journals, setJournals] = useState([]);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournals = useCallback(() => {
    setIsLoading(true);
    setHasError(false);

    // Use 5-minute cache — journals rarely change in real time
    cachedGet("/journals", {}, { ttlMs: 300000 })
      .then((response) => {
        setJournals(response.data ?? response);
      })
      .catch(() => {
        if (useDevelopmentFallback) {
          setJournals(mockJournals);
        } else {
          setHasError(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const filtered = journals.filter((journal) => {
    const normalizedQuery = query.toLowerCase();
    return (
      (journal.managingJournalName || "").toLowerCase().includes(normalizedQuery) ||
      (journal.journalDomainName || "").toLowerCase().includes(normalizedQuery) ||
      (journal.journalUrl || "").toLowerCase().includes(normalizedQuery) ||
      (journal.aboutJournal || "").toLowerCase().includes(normalizedQuery)
    );
  });

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchParams(query ? { search: query } : {});
  };

  function renderContent() {
    if (isLoading) {
      return <JournalsSkeleton />;
    }

    if (hasError) {
      return (
        <div className="mt-8">
          <EmptyState
            title="Failed to load journals"
            description="Something went wrong while fetching journals. Please try again."
          />
          <div className="mt-4 flex justify-center">
            <button onClick={loadJournals} className="button-primary px-6 py-2">
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!filtered.length) {
      return (
        <div className="mt-8">
          {query.trim() ? (
            <EmptyState
              title="No journals matched this search"
              description="Try a broader managing journal name, domain name, or URL search."
            />
          ) : (
            <EmptyState
              title="No live journals published yet"
              description="Published journals will appear here once they are available."
            />
          )}
        </div>
      );
    }

    return (
      <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((journal) => (
          <JournalCard key={journal.id} journal={journal} />
        ))}
      </div>
    );
  }

  return (
    <div className="section-shell pt-2 sm:pt-4 lg:pt-5">
      <div className="container-shell">
        <SectionHeader
          label="Journals"
          title="Journal listing with clean search and profile summaries"
          description="Browse the journal directory using the reduced Medmax journal profile fields and direct public journal URLs."
          className="max-w-none"
          titleClassName="xl:whitespace-nowrap"
          descriptionClassName="max-w-none lg:whitespace-nowrap"
        />

        <div className="mt-6 card-panel p-4 sm:mt-7 sm:p-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search size={18} className="hidden text-brand-slate sm:block" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journals" />
            <button type="submit" className="button-primary shrink-0 px-4 py-3">
              Search
            </button>
          </form>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
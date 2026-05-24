import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import JournalCard from "../../components/common/JournalCard";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals } from "../../data/mockData";

export default function JournalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [journals, setJournals] = useState([]);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournals = useCallback(() => {
    setIsLoading(true);
    return withFallback(() => api.get("/journals"), useDevelopmentFallback ? mockJournals : [])
      .then(setJournals)
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

        {isLoading ? (
          <div className="mt-8">
            <EmptyState
              title="Loading journals"
              description="The journal directory is being prepared."
            />
          </div>
        ) : filtered.length ? (
          <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filtered.map((journal) => (
              <JournalCard key={journal.id} journal={journal} />
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

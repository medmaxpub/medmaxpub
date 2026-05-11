import { Search } from "lucide-react";
import { useEffect, useState } from "react";
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
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  useEffect(() => {
    withFallback(() => api.get("/journals"), useDevelopmentFallback ? mockJournals : []).then(setJournals);
  }, [useDevelopmentFallback]);

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
    <div className="section-shell">
      <div className="container-shell">
        <SectionHeader
          label="Journals"
          title="Journal listing with clean search and profile summaries"
          description="Browse the journal directory using the reduced Medmax journal profile fields and direct public journal URLs."
        />

        <div className="mt-8 card-panel p-4 sm:p-6">
          <div className="grid gap-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Search size={18} className="hidden text-brand-slate sm:block" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journals" />
              <button type="submit" className="button-primary shrink-0 px-4 py-3">
                Search
              </button>
            </form>
          </div>
        </div>

        {filtered.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((journal) => (
              <JournalCard key={journal.id} journal={journal} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title="No journals matched this search"
              description="Try a broader managing journal name, domain name, or URL search."
            />
          </div>
        )}
      </div>
    </div>
  );
}

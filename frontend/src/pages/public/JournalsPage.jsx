import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals } from "../../data/mockData";

export default function JournalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [journals, setJournals] = useState([]);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [filter, setFilter] = useState("All");
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  useEffect(() => {
    withFallback(() => api.get("/journals"), useDevelopmentFallback ? mockJournals : []).then(setJournals);
  }, [useDevelopmentFallback]);

  const categories = ["All", ...new Set((journals.length ? journals : mockJournals).map((journal) => journal.category))];

  const filtered = journals.filter((journal) => {
    const normalizedQuery = query.toLowerCase();
    const matchesQuery =
      journal.title.toLowerCase().includes(normalizedQuery) ||
      journal.issn.toLowerCase().includes(normalizedQuery) ||
      journal.description.toLowerCase().includes(normalizedQuery);
    const matchesFilter = filter === "All" || journal.category === filter;
    return matchesQuery && matchesFilter;
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
          title="Journal listing with search and category filtering"
          description="This directory follows the structured, professional conference-and-publication feel of the medmaxpub platform."
        />

        <div className="mt-8 card-panel p-6">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_0.6fr]">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <Search size={18} className="text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journals" />
              <button type="submit" className="button-primary px-4 py-3">
                Search
              </button>
            </form>

            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((journal) => (
              <article key={journal.id} className="card-panel overflow-hidden">
                <img src={journal.coverImageUrl} alt={journal.title} className="h-72 w-full object-cover" />
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">{journal.category}</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-brand-navy">{journal.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{journal.issn}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{journal.description}</p>
                  <Link to={`/journals/${journal.slug}/home`} className="button-primary mt-5">
                    View Journal
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title="No journals matched this search"
              description="Try a broader title search or switch the category filter back to All."
            />
          </div>
        )}
      </div>
    </div>
  );
}

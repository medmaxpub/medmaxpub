import { Link } from "react-router-dom";
import { buildJournalSectionPath } from "../../utils/journalLinks";

function getJournalCoverImage(journal) {
  if (journal.coverImage) {
    return journal.coverImage;
  }

  return `https://placehold.co/640x820/ffffff/111827?text=${encodeURIComponent(journal.managingJournalName || "Medmax Journal")}`;
}

export default function JournalCard({ journal }) {
  return (
    <Link key={journal.id} to={buildJournalSectionPath(journal.publicJournalUrl || journal.journalUrl, "about")} className="journal-card-link">
      <article className="card-panel h-full overflow-hidden p-0">
        <div className="aspect-[4/5] overflow-hidden bg-brand-sky">
          <img
            src={getJournalCoverImage(journal)}
            alt={`${journal.managingJournalName} cover`}
            className="h-full w-full object-cover object-center transition duration-500 hover:scale-[1.03]"
          />
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold leading-tight text-brand-ink sm:text-2xl">
            {journal.managingJournalName}
          </h3>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-brand-gold">
            {journal.issn || "ISSN pending"}
          </p>
        </div>
      </article>
    </Link>
  );
}

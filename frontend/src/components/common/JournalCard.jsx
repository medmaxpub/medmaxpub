import { Link } from "react-router-dom";
import { buildJournalSectionPath } from "../../utils/journalLinks";
import { scrollWindowToTop } from "../../utils/scrollPosition";

function getJournalCoverImage(journal) {
  if (journal.coverImage) {
    return journal.coverImage;
  }

  return `https://placehold.co/640x820/ffffff/111827?text=${encodeURIComponent(journal.managingJournalName || "Medmax Journal")}`;
}

export default function JournalCard({ journal }) {
  return (
    <Link
      key={journal.id}
      to={buildJournalSectionPath(journal.publicJournalUrl || journal.journalUrl, "home")}
      className="journal-card-link"
      onClick={scrollWindowToTop}
    >
      <article className="card-panel h-full overflow-hidden p-0">
        <div className="aspect-[4/5] overflow-hidden bg-brand-sky">
          <img
            src={getJournalCoverImage(journal)}
            alt={`${journal.managingJournalName} cover`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center transition duration-500 hover:scale-[1.03]"
          />
        </div>

        <div className="flex min-h-[104px] flex-col justify-center p-5 sm:min-h-[120px] sm:p-6">
          <h3 className="font-display text-base font-semibold leading-snug text-brand-ink sm:text-lg">
            {journal.managingJournalName}
          </h3>
          {journal.issn ? (
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-brand-gold">
              ISSN: {journal.issn}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
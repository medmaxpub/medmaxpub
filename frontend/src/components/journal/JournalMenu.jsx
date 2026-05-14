import { NavLink } from "react-router-dom";
import { buildJournalSectionPath } from "../../utils/journalLinks";

const items = [
  { label: "Home", slug: "home" },
  { label: "About", slug: "about" },
  { label: "Aim & Scope", slug: "aim-scope" },
  { label: "Editorial Board", slug: "editorial-board" },
  { label: "Author Guidelines", slug: "author-guidelines" },
  { label: "Article in Press", slug: "article-in-press" },
  { label: "Current Issue", slug: "current-issue" },
  { label: "Archive", slug: "archive" }
];

export default function JournalMenu({ journalUrl }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <NavLink
          key={item.slug}
          to={buildJournalSectionPath(journalUrl, item.slug)}
          className={({ isActive }) =>
            `journal-nav-link ${
              isActive ? "journal-nav-link-active" : ""
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

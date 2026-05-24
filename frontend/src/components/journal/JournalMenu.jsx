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

export default function JournalMenu({ journalUrl, className = "", linkClassName = "" }) {
  const wrapperClassName = ["flex flex-wrap gap-2", className].filter(Boolean).join(" ");

  return (
    <div className={wrapperClassName}>
      {items.map((item) => (
        <NavLink
          key={item.slug}
          to={buildJournalSectionPath(journalUrl, item.slug)}
          className={({ isActive }) =>
            ["journal-nav-link", isActive ? "journal-nav-link-active" : "", linkClassName].filter(Boolean).join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

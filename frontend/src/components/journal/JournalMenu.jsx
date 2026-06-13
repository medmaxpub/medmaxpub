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
  { label: "Archive", slug: "archive" },
];

export default function JournalMenu({
  journalUrl,
  className = "",
  linkClassName = "",
}) {
  return (
    <div
      className={[
        "flex flex-nowrap items-center gap-2 overflow-x-auto",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((item) => (
        <NavLink
          key={item.slug}
          to={buildJournalSectionPath(journalUrl, item.slug)}
          className={({ isActive }) =>
            [
              "journal-nav-link whitespace-nowrap flex-shrink-0",
              isActive ? "journal-nav-link-active" : "",
              linkClassName,
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

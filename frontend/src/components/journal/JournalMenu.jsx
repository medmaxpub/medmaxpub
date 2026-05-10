import { NavLink } from "react-router-dom";

const items = [
  { label: "Home", slug: "home" },
  { label: "About", slug: "about" },
  { label: "Aim & Scope", slug: "aim-scope" },
  { label: "Editorial Board", slug: "editorial-board" },
  { label: "Author Guidelines", slug: "author-guidelines" },
  { label: "Article In Press", slug: "article-in-press" },
  { label: "Journal PPTs", slug: "ppts" },
  { label: "Journal Videos", slug: "videos" },
  { label: "Current Issue", slug: "current-issue" },
  { label: "Archive", slug: "archive" }
];

export default function JournalMenu({ journalSlug }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <NavLink
          key={item.slug}
          to={`/journals/${journalSlug}/${item.slug}`}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm font-medium ${
              isActive ? "bg-brand-navy text-white" : "bg-white text-slate-700 hover:bg-slate-100"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

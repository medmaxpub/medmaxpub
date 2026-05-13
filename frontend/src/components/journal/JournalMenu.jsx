import { NavLink } from "react-router-dom";

const items = [
  { label: "About Journal", slug: "about" },
  { label: "Journal Instructions", slug: "instructions" },
  { label: "Journal PDFs", slug: "pdfs" },
  { label: "Journal PPTs", slug: "ppts" },
  { label: "Journal Videos", slug: "videos" },
  { label: "Current Issue", slug: "current-issue" },
  { label: "Archive", slug: "archive" }
];

export default function JournalMenu({ journalUrl }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <NavLink
          key={item.slug}
          to={`/journals/${journalUrl}/${item.slug}`}
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

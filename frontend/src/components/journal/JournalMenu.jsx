import { NavLink } from "react-router-dom";

const items = [
  { label: "About Journal", slug: "about" },
  { label: "Journal Instructions", slug: "instructions" },
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
            `rounded-full px-3 py-2 text-sm font-medium sm:px-4 ${
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

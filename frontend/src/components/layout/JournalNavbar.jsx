import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const journalNavItems = [
  { label: "Back", to: "/home" }
];

function isItemActive(item, pathname) {
  if (item.kind === "journal-home") {
    return pathname === "/journals";
  }

  if (item.to === "/journals") {
    return pathname.startsWith("/journals/");
  }

  return pathname === item.to || (item.to === "/" && pathname === "/home");
}

export default function JournalNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const activeItems = useMemo(
    () => journalNavItems.map((item) => ({ ...item, active: isItemActive(item, location.pathname) })),
    [location.pathname]
  );

  return (
    <div className="sticky top-0 z-30 border-b border-brand-sky bg-white/95 backdrop-blur">
      <div className="container-shell flex items-center justify-between py-4">
        <div className="flex items-center">
          <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-20 w-auto sm:h-24 lg:h-24" />
        </div>

        <nav className="hidden flex-wrap items-center gap-2 lg:flex">
          {activeItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={`journal-nav-link ${item.active ? "journal-nav-link-active" : ""}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex rounded-2xl border border-brand-sky p-3 text-brand-navy lg:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close journal menu" : "Open journal menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="container-shell pb-4 lg:hidden">
          <div className="card-panel flex flex-col gap-2 p-3 sm:p-4">
            {activeItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={`journal-nav-link justify-center ${item.active ? "journal-nav-link-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

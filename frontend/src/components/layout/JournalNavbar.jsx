import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { medmaxTransparentLogo } from "../../assets/branding";
import JournalMenu from "../journal/JournalMenu";

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
  const { journalUrl, section } = useParams();
  const backTo = location.pathname === "/journals" ? "/" : "/journals";
  const showJournalLinks = Boolean(journalUrl && section);
  const showMobileBackOnly = !showJournalLinks;
  const activeItems = useMemo(
    () => [{ label: "Back", to: backTo, active: location.pathname.startsWith("/journals") }],
    [backTo, location.pathname]
  );

  return (
    <div className="sticky top-0 z-30 bg-brand-mist/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-4 sm:px-5 lg:gap-4 lg:px-6">
        <div className="flex items-center lg:-ml-1">
          <Link to="/" className="inline-flex items-center">
            <img src={medmaxTransparentLogo} alt="Medmax Publishers" className="h-24 w-auto sm:h-28 lg:h-28" />
          </Link>
        </div>

        {showJournalLinks ? (
          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <JournalMenu journalUrl={journalUrl} className="justify-center" linkClassName="px-3 xl:px-4" />
          </div>
        ) : (
          <div className="hidden flex-1 lg:block" />
        )}

        <nav className="hidden flex-wrap items-center gap-2 lg:ml-auto lg:flex lg:justify-end">
          {activeItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={`journal-nav-link ${item.active ? "journal-nav-link-active" : ""}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {showMobileBackOnly ? (
          <NavLink
            to={backTo}
            className="journal-nav-link ml-auto lg:hidden"
          >
            Back
          </NavLink>
        ) : (
          <button
            type="button"
            className="ml-auto inline-flex rounded-2xl border border-brand-border bg-brand-surface p-3 text-brand-ink lg:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Close journal menu" : "Open journal menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      {open && showJournalLinks ? (
        <div className="container-shell pb-4 lg:hidden">
          <div className="flex flex-col gap-3">
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
            {showJournalLinks ? (
              <JournalMenu
                journalUrl={journalUrl}
                className="flex-col"
                linkClassName="justify-center"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

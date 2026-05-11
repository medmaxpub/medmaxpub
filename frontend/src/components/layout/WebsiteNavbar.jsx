import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const websiteNavItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Journals", to: "/journals" },
  { label: "PPTS", to: "/ppts" },
  { label: "Video's", to: "/videos" },
  { label: "Submit Manuscript", to: "/submit-manuscript" },
  { label: "Membership", to: "/membership" },
  { label: "Contact", to: "/contact" }
];

function isItemActive(item, pathname) {
  if (item.to === "/") {
    return pathname === "/" || pathname === "/home";
  }

  return pathname === item.to;
}

export default function WebsiteNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const activeItems = useMemo(
    () => websiteNavItems.map((item) => ({ ...item, active: isItemActive(item, location.pathname) })),
    [location.pathname]
  );

  return (
    <div className="sticky top-0 z-30 border-b border-brand-sky bg-white/95 backdrop-blur">
      <div className="container-shell flex items-center justify-between py-3">
        <nav className="hidden flex-wrap items-center gap-2 lg:flex">
          {activeItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={`website-nav-link ${item.active ? "website-nav-link-active" : ""}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex rounded-2xl border border-brand-sky p-3 text-brand-navy lg:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close website menu" : "Open website menu"}
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
                className={`website-nav-link justify-center ${item.active ? "website-nav-link-active" : ""}`}
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

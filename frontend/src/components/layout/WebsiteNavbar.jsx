import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="sticky top-0 z-30 border-b border-brand-crimson bg-brand-crimson shadow-[0_14px_30px_rgba(198,40,40,0.22)]">
      <div className="container-shell flex items-center justify-between py-2">
        <nav className="hidden flex-wrap items-center gap-2 lg:flex">
          {activeItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={`website-nav-link ${item.active ? "website-nav-link-active" : ""}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex rounded-full border border-white/20 bg-white/10 p-3 text-white shadow-lg lg:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close website menu" : "Open website menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="container-shell pb-4 lg:hidden">
          <div className="flex flex-col gap-2 rounded-[1.75rem] border border-white/15 bg-brand-crimson p-3 shadow-[0_20px_40px_rgba(120,18,18,0.28)] sm:p-4">
            {activeItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={`website-nav-link justify-center ${item.active ? "website-nav-link-active" : ""}`}
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

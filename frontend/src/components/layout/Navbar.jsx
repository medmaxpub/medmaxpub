import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Journals", to: "/journals" },
  { label: "PPTs", to: "/ppts" },
  { label: "Videos", to: "/videos" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" }
];

function linkClass({ isActive }) {
  return `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-brand-navy text-white" : "text-brand-ink hover:bg-brand-sky"
  }`;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 border-b border-brand-sky bg-white/95 backdrop-blur">
      <div className="container-shell flex items-center justify-between py-3">
        <nav className="hidden flex-wrap items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex rounded-full border border-brand-sky p-3 text-brand-navy lg:hidden"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="container-shell pb-4 lg:hidden">
          <div className="card-panel flex flex-col gap-2 p-3 sm:p-4">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

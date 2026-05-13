import { Archive, BookOpenCheck, FileClock, LayoutGrid, LogOut, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Welcome", to: "/user/welcome", icon: LayoutGrid },
  { label: "Editorial Board", to: "/user/editorial-board", icon: Users },
  { label: "Articles in Press", to: "/user/articles-in-press", icon: FileClock },
  { label: "Current Issue", to: "/user/current-issue", icon: BookOpenCheck },
  { label: "Archive Pages", to: "/user/archive-pages", icon: Archive }
];

export default function UserLayout() {
  const { exitImpersonation, logout, user } = useAuth();
  const navigate = useNavigate();
  const isImpersonating = Boolean(user?.impersonator);

  const handleLogout = () => {
    logout();
    navigate("/user/login");
  };

  const handleExitImpersonation = () => {
    const originalRole = user?.impersonator?.role;
    exitImpersonation();
    navigate(originalRole === "super_user" ? "/admin/dashboard" : "/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-brand-border bg-white px-6 py-8">
          <div className="inline-flex rounded-[1.15rem] border border-brand-border bg-brand-elevated px-4 py-3 shadow-panel">
            <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-12 w-auto" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.26em] text-brand-navy">Journal User Portal</p>

          <div className="mt-8 rounded-[1.15rem] border border-brand-border bg-brand-elevated p-4 shadow-panel">
            <p className="text-sm text-brand-slate">Signed in as</p>
            <p className="mt-1 text-lg font-semibold text-brand-ink">{user?.name || "Journal User"}</p>
            <p className="mt-1 text-sm text-brand-slate">@{user?.userName}</p>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-brand-navy/30 bg-blue-50 text-brand-ink shadow-[0_10px_24px_rgba(37,99,235,0.08)]"
                      : "border-transparent bg-transparent text-brand-slate hover:border-brand-border hover:bg-brand-sky hover:text-brand-ink"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button type="button" onClick={handleLogout} className="button-secondary mt-8 w-full text-brand-ink">
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </aside>

        <div className="overflow-x-hidden">
          {isImpersonating ? (
            <div className="border-b border-brand-border bg-brand-elevated px-4 py-3 text-sm text-brand-ink sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Super User logged in as <span className="font-semibold">{user?.userName}</span>
                </p>
                <button type="button" onClick={handleExitImpersonation} className="button-secondary px-4 py-2">
                  Exit User Mode
                </button>
              </div>
            </div>
          ) : null}

          <header className="border-b border-brand-border bg-white px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-navy">Publishing Workspace</p>
                <h1 className="mt-2 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">Journal Dashboard</h1>
              </div>
            </div>
          </header>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

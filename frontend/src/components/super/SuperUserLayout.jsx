import { BookOpenText, LayoutGrid, LogOut, MessageSquareQuote, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Welcome", to: "/superuser/dashboard", icon: LayoutGrid },
  { label: "Users", to: "/superuser/users", icon: Users },
  { label: "Journals", to: "/superuser/journals", icon: BookOpenText },
  { label: "Testimonials", to: "/superuser/testimonials", icon: MessageSquareQuote }
];

export default function SuperUserLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-brand-mist">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-brand-border bg-brand-surface/80 px-6 py-8 backdrop-blur-xl">
          <div className="inline-flex rounded-[1.15rem] border border-brand-border/70 bg-brand-elevated/80 px-4 py-3 shadow-panel">
            <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-12 w-auto" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.26em] text-brand-navy">Super User Portal</p>

          <div className="mt-8 rounded-[1.15rem] border border-brand-border/70 bg-brand-elevated/70 p-4 shadow-panel">
            <p className="text-sm text-brand-slate">Signed in as</p>
            <p className="mt-1 text-lg font-semibold text-brand-ink">{user?.name || "Super User"}</p>
            <p className="mt-1 text-sm text-brand-slate">@{user?.userName}</p>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "border-brand-navy/60 bg-brand-navy/10 text-brand-ink shadow-[0_0_0_1px_rgba(88,166,255,0.12),0_20px_34px_rgba(2,6,23,0.3)]"
                      : "border-transparent bg-transparent text-brand-slate hover:border-brand-border/60 hover:bg-brand-surface/50 hover:text-brand-ink"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button type="button" onClick={logout} className="button-secondary mt-8 w-full text-brand-ink">
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </aside>

        <div className="overflow-x-hidden">
          <header className="border-b border-brand-border/70 bg-brand-surface/55 px-4 py-5 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-navy">Control Center</p>
                <h1 className="mt-2 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">Super User Dashboard</h1>
              </div>
            </div>
          </header>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

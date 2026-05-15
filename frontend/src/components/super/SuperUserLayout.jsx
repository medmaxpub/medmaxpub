import { BookOpenText, FileVideo, LayoutGrid, LogOut, MessageSquareQuote, Presentation, Send, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { medmaxTransparentLogo } from "../../assets/branding";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Welcome", to: "/superuser/dashboard", icon: LayoutGrid },
  { label: "Users", to: "/superuser/users", icon: Users },
  { label: "Journals", to: "/superuser/journals", icon: BookOpenText },
  { label: "Online Submission", to: "/superuser/online-submission", icon: Send },
  { label: "PPT Upload", to: "/superuser/ppt-upload", icon: Presentation },
  { label: "Video Upload", to: "/superuser/video-upload", icon: FileVideo },
  { label: "Testimonials", to: "/superuser/testimonials", icon: MessageSquareQuote }
];

export default function SuperUserLayout() {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const portalLabel = isAdmin ? "Admin Portal" : "Super User Portal";
  const dashboardTitle = isAdmin ? "Admin Dashboard" : "Super User Dashboard";

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-brand-border bg-white px-6 py-8">
          <div className="inline-flex rounded-[1.15rem] border border-brand-border bg-brand-elevated px-4 py-3 shadow-panel">
            <img src={medmaxTransparentLogo} alt="Medmax Publishers" className="h-12 w-auto" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.26em] text-brand-navy">{portalLabel}</p>

          <div className="mt-8 rounded-[1.15rem] border border-brand-border bg-brand-elevated p-4 shadow-panel">
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

          <button type="button" onClick={logout} className="button-secondary mt-8 w-full text-brand-ink">
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </aside>

        <div className="overflow-x-hidden">
          <header className="border-b border-brand-border bg-white px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-navy">Control Center</p>
                <h1 className="mt-2 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">{dashboardTitle}</h1>
              </div>
            </div>
          </header>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

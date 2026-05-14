import { BookOpenText, LogOut, Quote } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { medmaxTransparentLogo } from "../../assets/branding";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { exitImpersonation, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isImpersonating = Boolean(user?.impersonator);
  const activeHash = location.hash || "#journals";
  const items = [
    { icon: BookOpenText, label: "Journals", hash: "#journals" },
    ...(isAdmin ? [{ icon: Quote, label: "Testimonials", hash: "#testimonials" }] : [])
  ];

  const handleSectionNavigate = (hash) => {
    if (location.pathname !== "/admin/dashboard" || location.hash !== hash) {
      navigate(`/admin/dashboard${hash}`);
      return;
    }

    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExitImpersonation = () => {
    const originalRole = user?.impersonator?.role;
    exitImpersonation();
    navigate(originalRole === "super_user" ? "/superuser/dashboard" : "/admin/dashboard");
  };

  const impersonatorLabel = user?.impersonator?.role === "super_user" ? "Super User" : "Admin";

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-brand-border bg-white px-6 py-8 text-brand-ink">
          <div>
            <div className="inline-flex rounded-3xl border border-brand-border bg-brand-elevated px-4 py-3 shadow-panel">
              <img src={medmaxTransparentLogo} alt="Medmax Publishers" className="h-12 w-auto" />
            </div>
            <p className="mt-2 text-sm text-brand-slate">{isAdmin ? "Admin Portal" : "User Portal"}</p>
          </div>

          <div className="mt-10 rounded-3xl border border-brand-border bg-brand-elevated p-4 text-sm">
            <p className="font-semibold">{user?.name || "Portal User"}</p>
            <p className="mt-1 text-brand-slate">{user?.userName}</p>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSectionNavigate(item.hash)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  activeHash === item.hash
                    ? "border-brand-navy/30 bg-blue-50 text-brand-ink"
                    : "border-transparent hover:border-brand-border hover:bg-brand-sky"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="button-secondary mt-8 w-full"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </aside>

        <div className="overflow-x-hidden">
          {isImpersonating ? (
            <div className="border-b border-brand-border bg-brand-elevated px-4 py-3 text-sm text-brand-ink sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  {impersonatorLabel} logged in as <span className="font-semibold">{user.userName}</span>
                </p>
                <button
                  type="button"
                  onClick={handleExitImpersonation}
                  className="button-secondary"
                >
                  Exit User Mode
                </button>
              </div>
            </div>
          ) : null}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

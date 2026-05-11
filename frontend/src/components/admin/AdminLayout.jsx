import { BookOpenText, LogOut, Quote, Users } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
    ...(isAdmin ? [{ icon: Users, label: "Users", hash: "#users" }] : []),
    ...(isAdmin ? [{ icon: Quote, label: "Testimonials", hash: "#testimonials" }] : [])
  ];

  const handleSectionNavigate = (hash) => {
    if (location.pathname !== "/admin/dashboard" || location.hash !== hash) {
      navigate(`/admin/dashboard${hash}`);
      return;
    }

    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-brand-navy px-6 py-8 text-white">
          <div>
            <div className="inline-flex rounded-3xl bg-white px-4 py-3 shadow-panel">
              <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-12 w-auto" />
            </div>
            <p className="mt-2 text-sm text-slate-300">{isAdmin ? "Admin Portal" : "User Portal"}</p>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="font-semibold">{user?.name || "Portal User"}</p>
            <p className="mt-1 text-slate-300">{user?.userName}</p>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSectionNavigate(item.hash)}
                className={`rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-white/10 ${
                  activeHash === item.hash ? "bg-white/10" : ""
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
            className="button-secondary mt-8 w-full border-white text-white hover:bg-white hover:text-brand-navy"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </aside>

        <div className="overflow-x-hidden">
          {isImpersonating ? (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Admin is logged in as <span className="font-semibold">{user.userName}</span>
                </p>
                <button
                  type="button"
                  onClick={exitImpersonation}
                  className="button-secondary border-amber-300 text-amber-900 hover:bg-amber-100"
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

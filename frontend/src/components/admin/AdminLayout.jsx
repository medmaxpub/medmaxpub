import { BookOpen, FileArchive, Files, LayoutDashboard, LogOut, MessageSquare, Video } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const items = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/admin/dashboard" },
    { icon: BookOpen, label: "Journals", to: "/admin/dashboard#journals" },
    { icon: FileArchive, label: "Issues & Articles", to: "/admin/dashboard#issues" },
    { icon: Files, label: "PPT & Videos", to: "/admin/dashboard#assets" },
    ...(isSuperAdmin ? [{ icon: Video, label: "Testimonials", to: "/admin/dashboard#videos" }] : []),
    ...(isSuperAdmin ? [{ icon: MessageSquare, label: "Contact", to: "/admin/dashboard#contacts" }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-brand-navy px-6 py-8 text-white">
          <div>
            <div className="inline-flex rounded-3xl bg-white px-4 py-3 shadow-panel">
              <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-12 w-auto" />
            </div>
            <p className="mt-2 text-sm text-slate-300">{isSuperAdmin ? "Super Admin Portal" : "Journal Admin Portal"}</p>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="font-semibold">{user?.name || "Admin User"}</p>
            <p className="mt-1 text-slate-300">{user?.email}</p>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {items.map((item) => (
              <NavLink key={item.label} to={item.to} className="rounded-2xl px-4 py-3 text-sm hover:bg-white/10">
                <span className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>

          <button type="button" onClick={logout} className="button-secondary mt-8 w-full border-white text-white hover:bg-white hover:text-brand-navy">
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </aside>

        <div className="overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

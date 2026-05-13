import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, redirectTo = "/login" }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <div className="container-shell py-16 text-center text-brand-slate">Checking admin session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    const fallbackPath = user?.role === "super_user" ? "/admin/dashboard" : user?.role === "user" ? "/user/dashboard" : "/login";
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}

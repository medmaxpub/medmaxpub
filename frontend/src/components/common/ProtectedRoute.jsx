import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RouteLoadingScreen from "./RouteLoadingScreen";

export default function ProtectedRoute({ allowedRoles, redirectTo = "/login" }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <RouteLoadingScreen label="Checking admin session" />;
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

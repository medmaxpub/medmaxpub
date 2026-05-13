import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("admin");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedUserPortal = location.pathname.startsWith("/user");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(identifier, password);

      if (authenticatedUser?.role === "super_user" || authenticatedUser?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (authenticatedUser?.role === "user") {
        navigate("/user/dashboard");
      } else {
        logout();
        setError("This account does not have access to the portal.");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed. Please check your username and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mist px-4 py-12">
      <form onSubmit={handleSubmit} className="card-panel w-full max-w-md p-8">
        <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-16 w-auto" />
        <span className="eyebrow">{requestedUserPortal ? "User Portal" : "Portal Login"}</span>
        <h1 className="font-display text-4xl font-semibold text-brand-ink">Secure Login</h1>
        <p className="mt-4 text-brand-slate">Use the same login for admin and journal user accounts. Access is routed automatically after sign in.</p>

        <div className="mt-8 space-y-4">
          <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="User Name or Email" required />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            required
          />
        </div>

        {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}

        <button type="submit" className="button-primary mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { medmaxTransparentLogo } from "../../assets/branding";
import { useAuth } from "../../context/AuthContext";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedUserPortal = location.pathname.startsWith("/user");
  const identifierInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [allowTyping, setAllowTyping] = useState(false);

  useEffect(() => {
    const clearAutofilledValues = () => {
      setIdentifier("");
      setPassword("");

      if (identifierInputRef.current) {
        identifierInputRef.current.value = "";
      }

      if (passwordInputRef.current) {
        passwordInputRef.current.value = "";
      }
    };

    clearAutofilledValues();
    const timeoutId = window.setTimeout(clearAutofilledValues, 150);

    return () => window.clearTimeout(timeoutId);
  }, []);

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
      <form onSubmit={handleSubmit} className="card-panel w-full max-w-md p-8" autoComplete="off">
        <input
          type="text"
          name="username"
          autoComplete="username"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <img src={medmaxTransparentLogo} alt="Medmax Publishers" className="h-16 w-auto" />
        <span className="eyebrow">{requestedUserPortal ? "User Portal" : "Portal Login"}</span>
        <h1 className="font-display text-4xl font-semibold text-brand-ink">Secure Login</h1>
        <p className="mt-4 text-brand-slate">Use the same login for admin and journal user accounts. Access is routed automatically after sign in.</p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="form-label" data-required="true">User Name or Email</label>
            <input
              ref={identifierInputRef}
              name="portal-identifier"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              onFocus={() => setAllowTyping(true)}
              placeholder="User Name or Email"
              autoComplete="off"
              readOnly={!allowTyping}
              required
            />
          </div>
          <div>
            <label className="form-label" data-required="true">Password</label>
            <input
              ref={passwordInputRef}
              name="portal-secret"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onFocus={() => setAllowTyping(true)}
              placeholder="Password"
              type="password"
              autoComplete="new-password"
              readOnly={!allowTyping}
              required
            />
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}

        <button type="submit" className="button-primary mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

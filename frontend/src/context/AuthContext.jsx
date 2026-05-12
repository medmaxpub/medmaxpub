import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: user.role || "admin",
    assignedJournalIds: user.assignedJournalIds || [],
    impersonator: user.impersonator || null
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("medmax-user");

    if (storedUser) {
      setUser(normalizeUser(JSON.parse(storedUser)));
    }

    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const response = await api.post("/auth/login", { identifier, password });
    return authenticate(response.data);
  };

  const authenticate = (payload) => {
    const normalizedUser = normalizeUser(payload.user);

    localStorage.setItem("medmax-token", payload.token);
    localStorage.setItem("medmax-user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => {
    localStorage.removeItem("medmax-impersonation-original-token");
    localStorage.removeItem("medmax-impersonation-original-user");
    localStorage.removeItem("medmax-token");
    localStorage.removeItem("medmax-user");
    setUser(null);
  };

  const beginImpersonation = (payload) => {
    const currentToken = localStorage.getItem("medmax-token");
    const currentUser = localStorage.getItem("medmax-user");

    if (currentToken && currentUser && !localStorage.getItem("medmax-impersonation-original-token")) {
      localStorage.setItem("medmax-impersonation-original-token", currentToken);
      localStorage.setItem("medmax-impersonation-original-user", currentUser);
    }

    authenticate(payload);
  };

  const exitImpersonation = () => {
    const originalToken = localStorage.getItem("medmax-impersonation-original-token");
    const originalUser = localStorage.getItem("medmax-impersonation-original-user");

    if (!originalToken || !originalUser) {
      return;
    }

    localStorage.setItem("medmax-token", originalToken);
    localStorage.setItem("medmax-user", originalUser);
    localStorage.removeItem("medmax-impersonation-original-token");
    localStorage.removeItem("medmax-impersonation-original-user");
    setUser(normalizeUser(JSON.parse(originalUser)));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        authenticate,
        beginImpersonation,
        exitImpersonation,
        logout,
        isAuthenticated: Boolean(user),
        isSuperUser: user?.role === "super_user"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

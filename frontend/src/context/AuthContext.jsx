import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: user.role || "super_admin",
    assignedJournalIds: user.assignedJournalIds || []
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

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    authenticate(response.data);
  };

  const authenticate = (payload) => {
    const normalizedUser = normalizeUser(payload.user);

    localStorage.setItem("medmax-token", payload.token);
    localStorage.setItem("medmax-user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("medmax-token");
    localStorage.removeItem("medmax-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        authenticate,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

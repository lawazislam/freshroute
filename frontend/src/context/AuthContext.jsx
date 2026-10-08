import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, saveToken, clearToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("freshroute_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login({ email, password });
    saveToken(token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (payload) => {
    await api.register(payload);
    return login(payload.email, payload.password);
  }, [login]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

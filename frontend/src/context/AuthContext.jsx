import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setAccessToken } from "../api/client";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, email, name, phone_number }
  const [token, setToken] = useState(null);     // access token (in memory only)
  const [ready, setReady] = useState(false);    // true once initial restore attempt is done

  // Restore session on app load using stored refresh token
  useEffect(() => {
    const restore = async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) { setReady(true); return; }

      try {
        const res = await client.post("/auth/refresh", { refresh_token: refreshToken });
        const newToken = res.data.access_token;
        _applyToken(newToken);
        await _fetchProfile(newToken);
      } catch {
        // Refresh token invalid/expired — clear it silently
        localStorage.removeItem("refresh_token");
      } finally {
        setReady(true);
      }
    };
    restore();
  }, []);

  const _applyToken = (accessToken) => {
    setToken(accessToken);
    setAccessToken(accessToken);  // wire into axios interceptor
  };

  const _fetchProfile = async (accessToken) => {
    setAccessToken(accessToken);
    const res = await client.get("/user/profile");
    setUser(res.data);
  };

  const login = useCallback(async (email, password) => {
    const res = await client.post("/auth/signin", { email, password });
    const { access_token, refresh_token } = res.data;
    localStorage.setItem("refresh_token", refresh_token);
    _applyToken(access_token);
    await _fetchProfile(access_token);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try { await client.post("/auth/logout", { refresh_token: refreshToken }); } catch {}
    }
    localStorage.removeItem("refresh_token");
    setAccessToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

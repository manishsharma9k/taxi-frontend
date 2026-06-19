import { createContext, useState, useEffect } from "react";
import { API_URL } from "../api.js";

export const AuthContext = createContext();

const sanitizeToken = (value) => {
  if (!value) return null;
  const cleaned = String(value).trim();
  if (!cleaned || cleaned === "undefined" || cleaned === "null") return null;
  return cleaned;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    sanitizeToken(localStorage.getItem("qr_token")),
  );
  const [refresh, setRefresh] = useState(localStorage.getItem("qr_refresh") || null);
  const [role, setRole] = useState(localStorage.getItem("qr_role") || "user");
  const [authLoading, setAuthLoading] = useState(true);

  function logout() {
    // Clear auth state immediately so UI logs out without waiting for effects
    setUser(null);
    setToken(null);
    setRole("user");
    setAuthLoading(false);

    // Clear persisted session data immediately
    localStorage.removeItem("qr_token");
    localStorage.removeItem("qr_role");
    localStorage.removeItem("qr_login_time");
    localStorage.removeItem("qr_user_name");
    localStorage.removeItem("qr_refresh");
  }

  // 30-day session expiry check
  useEffect(() => {
    const loginTime = localStorage.getItem("qr_login_time");
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      if (elapsed > THIRTY_DAYS) {
        logout();
        return;
      }
      // Schedule auto-logout at exact expiry
      const remaining = THIRTY_DAYS - elapsed;
      const timer = setTimeout(() => logout(), remaining);
      return () => clearTimeout(timer);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("qr_token");
      localStorage.removeItem("qr_role");
      setUser(null);
      setAuthLoading(false);
      return;
    }

    let ignore = false;
    setAuthLoading(true);
    localStorage.setItem("qr_token", token);

    const tryUserMe = async () => {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, 'x-refresh-token': localStorage.getItem('qr_refresh') || '' },
      });
      if (res.ok) {
        const data = await res.json();
        const newAccess = res.headers.get('x-access-token');
        const newRefresh = null; // server rotates refresh only on /refresh endpoint
        if (newAccess) {
          localStorage.setItem('qr_token', newAccess);
          setToken(newAccess);
        }
        if (!ignore) {
          setUser({ ...data, role: "user" });
          setRole("user");
          localStorage.setItem("qr_role", "user");
          localStorage.setItem("qr_user_name", data?.name || "");
        }
        return true;
      }
      // return response so caller can decide to refresh
      const body = await res.json().catch(() => ({}));
      const err = new Error(body.message || 'USER_AUTH_FAILED');
      err.status = res.status;
      throw err;
    };

    const tryCaptainMe = async () => {
      const res = await fetch(`${API_URL}/api/captains/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("CAPTAIN_AUTH_FAILED");
      const data = await res.json();
      if (!ignore) {
        setUser({ ...data, role: "captain" });
        setRole("captain");
        localStorage.setItem("qr_role", "captain");
        localStorage.setItem("qr_user_name", data?.name || "");
      }
      return true;
    };

    (async () => {
      try {
        // Prefer stored role first, then fallback to the other role to avoid stale-role logout loops
        if (role === "captain") {
          try {
            await tryCaptainMe();
          } catch (e) {
            // If token expired, try refresh once
            if (e?.status === 401 && localStorage.getItem('qr_refresh')) {
              try {
                const r = await fetch(`${API_URL}/api/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken: localStorage.getItem('qr_refresh') }),
                });
                if (r.ok) {
                  const d = await r.json();
                  localStorage.setItem('qr_token', d.token);
                  localStorage.setItem('qr_refresh', d.refreshToken);
                  setToken(d.token);
                  setRefresh(d.refreshToken);
                  await tryUserMe();
                } else {
                  await tryUserMe();
                }
              } catch {
                await tryUserMe();
              }
            } else {
              await tryUserMe();
            }
          }
        } else {
          try {
            await tryUserMe();
          } catch (e) {
            if (e?.status === 401 && localStorage.getItem('qr_refresh')) {
              try {
                const r = await fetch(`${API_URL}/api/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken: localStorage.getItem('qr_refresh') }),
                });
                if (r.ok) {
                  const d = await r.json();
                  localStorage.setItem('qr_token', d.token);
                  localStorage.setItem('qr_refresh', d.refreshToken);
                  setToken(d.token);
                  setRefresh(d.refreshToken);
                  await tryUserMe();
                } else {
                  await tryCaptainMe();
                }
              } catch {
                await tryCaptainMe();
              }
            } else {
              await tryCaptainMe();
            }
          }
        }
      } catch {
        // Do not force-logout or clear user on transient /me failure.
        // Protected API calls will validate token; on 401 we logout at action level.
      } finally {
        if (!ignore) setAuthLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [token, role]);

  const sendOtp = async (phone) => {
    const res = await fetch(`${API_URL}/api/auth/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  const initLogin = async (phone, password) => {
    const res = await fetch(`${API_URL}/api/auth/login/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  const login = async (phone, password, otp) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // Persist immediately to avoid post-login race conditions
    localStorage.setItem("qr_token", data.token);
    if (data.refreshToken) localStorage.setItem("qr_refresh", data.refreshToken);
    localStorage.setItem("qr_role", "user");
    localStorage.setItem("qr_login_time", Date.now().toString());
    localStorage.setItem("qr_user_name", data.name || "");

    setRefresh(localStorage.getItem("qr_refresh"));
    setRole("user");
    setToken(data.token);
    setUser({ id: data.id, name: data.name, phone: data.phone, role: "user" });
    setAuthLoading(false);
    return data;
  };

  const signup = async (name, email, phone, password, otp) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    localStorage.setItem("qr_token", data.token);
    if (data.refreshToken) localStorage.setItem("qr_refresh", data.refreshToken);
    localStorage.setItem("qr_role", "user");
    localStorage.setItem("qr_login_time", Date.now().toString());
    localStorage.setItem("qr_user_name", data.name || "");

    setRefresh(localStorage.getItem("qr_refresh"));
    setRole("user");
    setToken(data.token);
    setUser({ id: data.id, name: data.name, phone: data.phone, role: "user" });
    setAuthLoading(false);
    return data;
  };

  const loginCaptain = async (email, password) => {
    const res = await fetch(`${API_URL}/api/captains/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    localStorage.setItem("qr_token", data.token);
    localStorage.setItem("qr_role", "captain");
    localStorage.setItem("qr_login_time", Date.now().toString());
    localStorage.setItem("qr_user_name", data.name || "");

    setRole("captain");
    setToken(data.token);
    setUser({
      id: data.id,
      name: data.name,
      phone: data.phone,
      role: "captain",
      car: data.car || data.vehicleType,
      approvalStatus: data.approvalStatus,
    });
    setAuthLoading(false);
    return data;
  };

  const loginCaptainDirect = (data) => {
    localStorage.setItem("qr_token", data.token);
    localStorage.setItem("qr_role", "captain");
    localStorage.setItem("qr_login_time", Date.now().toString());
    localStorage.setItem("qr_user_name", data?.captain?.name || "");

    setRole("captain");
    setToken(data.token);
    setUser({
      id: data.captain.id || data.captain._id,
      name: data.captain.name,
      phone: data.captain.phone,
      role: "captain",
      vehicleType: data.captain.vehicleType,
      approvalStatus: data.captain.approvalStatus,
    });
  };

  const isAuthenticated = Boolean(sanitizeToken(token));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        sendOtp,
        initLogin,
        login,
        signup,
        logout,
        loginCaptain,
        loginCaptainDirect,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

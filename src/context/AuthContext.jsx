import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qr_token') || null);
  const [role, setRole] = useState(localStorage.getItem('qr_role') || 'user');
  const [authLoading, setAuthLoading] = useState(true);

  // 24-hour session expiry check
  useEffect(() => {
    const loginTime = localStorage.getItem('qr_login_time');
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      if (elapsed > TWENTY_FOUR_HOURS) {
        logout();
        return;
      }
      // Schedule auto-logout at exact expiry
      const remaining = TWENTY_FOUR_HOURS - elapsed;
      const timer = setTimeout(() => logout(), remaining);
      return () => clearTimeout(timer);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('qr_token', token);
      localStorage.setItem('qr_role', role);
      
      if (role === 'captain') {
        fetch('http://localhost:5000/api/captains/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          if(res.ok) return res.json()
          throw new Error('Not auth')
        })
        .then(data => setUser({ ...data, role: 'captain' }))
        .catch(() => logout())
        .finally(() => setAuthLoading(false));
      } else {
        fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          if(res.ok) return res.json()
          throw new Error('Not auth')
        })
        .then(data => setUser({ ...data, role: 'user' }))
        .catch(() => logout())
        .finally(() => setAuthLoading(false));
      }
    } else {
      localStorage.removeItem('qr_token');
      localStorage.removeItem('qr_role');
      setUser(null);
      setAuthLoading(false);
    }
  }, [token, role]);

  const sendOtp = async (phone) => {
    const res = await fetch('http://localhost:5000/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  const initLogin = async (phone, password) => {
    const res = await fetch('http://localhost:5000/api/auth/login/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  const login = async (phone, password, otp) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setToken(data.token);
    setUser({ id: data.id, name: data.name, phone: data.phone });
    localStorage.setItem('qr_login_time', Date.now().toString());
    return data;
  };

  const signup = async (name, email, phone, password, otp) => {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setToken(data.token);
    setUser({ id: data.id, name: data.name, phone: data.phone });
    localStorage.setItem('qr_login_time', Date.now().toString());
    return data;
  };

  const loginCaptain = async (email, password) => {
    const res = await fetch('http://localhost:5000/api/captains/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setRole('captain');
    setToken(data.token);
    setUser({ id: data.id, name: data.name, phone: data.phone, role: 'captain', car: data.car || data.vehicleType, approvalStatus: data.approvalStatus });
    localStorage.setItem('qr_login_time', Date.now().toString());
    return data;
  };

  const loginCaptainDirect = (data) => {
    setRole('captain');
    setToken(data.token);
    setUser({ id: data.captain.id || data.captain._id, name: data.captain.name, phone: data.captain.phone, role: 'captain', vehicleType: data.captain.vehicleType, approvalStatus: data.captain.approvalStatus });
    localStorage.setItem('qr_login_time', Date.now().toString());
  };

  const logout = () => {
    setToken(null);
    setRole('user');
    localStorage.removeItem('qr_login_time');
  };

  return (
    <AuthContext.Provider value={{ user, token, sendOtp, initLogin, login, signup, logout, loginCaptain, loginCaptainDirect, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

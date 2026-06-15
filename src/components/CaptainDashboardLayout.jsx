import React, { useState, useEffect, useContext, useRef } from "react";
import "./CSS/CaptainDashboardLayout.css";
import {
  FaThLarge, FaRoute, FaHistory, FaWallet, FaUser,
  FaSignOutAlt, FaBars, FaMotorcycle, FaStar, FaComments
} from "react-icons/fa";
import { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Clock, XCircle, ShieldCheck, LogOut } from 'lucide-react';
import { io } from 'socket.io-client';
import CaptainOverview from "./CaptainOverview";
import CaptainActiveRides from "./CaptainActiveRides";
import CaptainRideHistory from "./CaptainRideHistory";
import CaptainEarnings from "./CaptainEarnings";
import CaptainProfile from "./CaptainProfile";
import CaptainChat from "./CaptainChat";

const socket = io('http://localhost:5000', { autoConnect: false });

const TABS = [
  { id: "overview",      label: "Overview",      icon: <FaThLarge /> },
  { id: "active-rides",  label: "Ride Requests", icon: <FaRoute /> },
  { id: "history",       label: "Ride History",  icon: <FaHistory /> },
  { id: "earnings",      label: "Earnings",      icon: <FaWallet /> },
  { id: "chat",          label: "Chat Admin",    icon: <FaComments /> },
  { id: "profile",       label: "My Profile",    icon: <FaUser /> },
];

const CaptainDashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isOnline, setIsOnline] = useState(false);
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const locationWatcher = useRef(null);

  useEffect(() => {
    if (!token || !user || user.role !== "captain") navigate("/captain-login");
  }, [token, user, navigate]);

  // Connect socket and restore online status from DB
  useEffect(() => {
    if (!user?.id) return;
    socket.connect();
    socket.emit('identify', { role: 'captain', id: user.id });
    // Fetch current online status from server
    fetch('http://localhost:5000/api/captains/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => {
      if (d.isOnline) setIsOnline(true);
    }).catch(() => {});
    return () => { socket.disconnect(); };
  }, [user?.id, token]);

  useEffect(() => {
    if (!isOnline || !navigator.geolocation || !token || !user?.id) {
      if (locationWatcher.current !== null) {
        navigator.geolocation.clearWatch(locationWatcher.current);
        locationWatcher.current = null;
      }
      return;
    }

    const updateLocation = async ({ coords }) => {
      const lat = coords.latitude;
      const lng = coords.longitude;
      if (!lat || !lng) return;

      socket.emit('captain:location', { captainId: user.id, lat, lng });
      await fetch('http://localhost:5000/api/captains/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lat, lng, isOnline: true })
      }).catch(() => {});
    };

    locationWatcher.current = navigator.geolocation.watchPosition(
      updateLocation,
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return () => {
      if (locationWatcher.current !== null) {
        navigator.geolocation.clearWatch(locationWatcher.current);
        locationWatcher.current = null;
      }
    };
  }, [isOnline, token, user?.id]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "You will be signed out of your captain account.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FFD700",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, Logout",
      background: "#141414",
      color: "#fff",
    }).then((r) => {
      if (r.isConfirmed) { logout(); navigate("/"); }
    });
  };

  const toggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    // Update online status only; do not clear existing location
    await fetch('http://localhost:5000/api/captains/location', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isOnline: next })
    }).catch(() => {});
    // If going offline, emit socket event
    if (!next && user?.id) {
      socket.emit('captain:offline', { captainId: user.id });
    }
    Swal.fire({
      title: next ? "You are Online!" : "You are Offline",
      text: next ? "You will now receive ride requests." : "You won't receive new ride requests.",
      icon: next ? "success" : "info",
      timer: 1800,
      showConfirmButton: false,
      background: "#141414",
      color: "#fff",
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":     return <CaptainOverview setActiveTab={setActiveTab} />;
      case "active-rides": return <CaptainActiveRides isOnline={isOnline} />;
      case "history":      return <CaptainRideHistory />;
      case "earnings":     return <CaptainEarnings />;
      case "chat":         return <CaptainChat />;
      case "profile":      return <CaptainProfile />;
      default:             return <CaptainOverview setActiveTab={setActiveTab} />;
    }
  };

  if (!user || user.role !== "captain") return null;

  // Pending approval guard
  if (user.approvalStatus === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '16px', padding: '3rem 2.5rem', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Clock size={36} color="#F59E0B" />
          </div>
          <h2 style={{ color: '#fff', fontWeight: '800', fontSize: '1.4rem', marginBottom: '0.75rem' }}>Under Review</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Hey <strong style={{ color: '#fff' }}>{user.name}</strong>! Your captain profile is being reviewed by our team. We'll notify you once approved — usually within 2 hours.
          </p>
          <div style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <ShieldCheck size={18} color="#22C55E" />
            <span style={{ fontSize: '0.82rem', color: '#888' }}>Verification in progress — sit tight!</span>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: '8px', padding: '0.6rem 1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', fontSize: '0.85rem' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    );
  }

  // Rejected guard
  if (user.approvalStatus === 'rejected') {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '16px', padding: '3rem 2.5rem', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <XCircle size={36} color="#EF4444" />
          </div>
          <h2 style={{ color: '#EF4444', fontWeight: '800', fontSize: '1.4rem', marginBottom: '0.75rem' }}>Application Rejected</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Sorry <strong style={{ color: '#fff' }}>{user.name}</strong>, your application was not approved. Please contact our support team for more details.
          </p>
          <button onClick={() => { logout(); navigate('/'); }} style={{ background: '#EF4444', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.7rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', fontWeight: '600' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    );
  }

  const tabLabel = TABS.find((t) => t.id === activeTab)?.label || "";

  return (
    <div className={`cdl-layout ${collapsed ? "cdl-collapsed" : ""}`}>
      <Toaster position="top-right" />

      {/* ── Sidebar ── */}
      <aside className="cdl-sidebar">
        <div className="cdl-logo-row">
          {!collapsed && <span className="cdl-logo-text">Captain Panel</span>}
          {collapsed && <FaMotorcycle size={22} color="#FFD700" />}
          <button className="cdl-toggle" onClick={() => setCollapsed((c) => !c)}>
            <FaBars />
          </button>
        </div>

        {/* Online toggle */}
        <button className={`cdl-online-btn ${isOnline ? "online" : ""}`} onClick={toggleOnline}>
          <span className="cdl-dot" />
          {!collapsed && <span>{isOnline ? "Online" : "Go Online"}</span>}
        </button>

        <ul className="cdl-menu">
          {TABS.map((t) => (
            <li
              key={t.id}
              className={activeTab === t.id ? "active" : ""}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="cdl-menu-icon">{t.icon}</span>
              <span className="cdl-menu-text">{t.label}</span>
            </li>
          ))}
        </ul>

        <button className="cdl-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="cdl-menu-icon" />
          <span className="cdl-menu-text">Logout</span>
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="cdl-main">
        <header className="cdl-header">
          <div>
            <h1 className="cdl-header-title">{tabLabel}</h1>
            <p className="cdl-header-sub">Welcome, {user?.name}</p>
          </div>
          <div className="cdl-header-right">
            <span className="cdl-vehicle-chip">
              <FaMotorcycle /> {user?.vehicleType?.toUpperCase()}
            </span>
            <div className="cdl-avatar-row">
              <div className="cdl-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="cdl-uname">{user?.name}</div>
                <div className="cdl-rating"><FaStar size={11} color="#FFD700" /> {user?.rating || "5.0"}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="cdl-body">{renderContent()}</div>
      </main>
    </div>
  );
};

export default CaptainDashboardLayout;

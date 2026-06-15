import React, { useState, useEffect, useRef } from "react";
import "./CSS/DashboardLayout.css";
import {
  FaThLarge,
  FaUsers,
  FaCar,
  FaEnvelope,
  FaSignOutAlt,
  FaBars,
  FaUserShield,
  FaRoute,
  FaMotorcycle,
  FaTaxi,
  FaClipboardList,
  FaComments,
  FaMapMarkedAlt,
  FaChevronDown
} from "react-icons/fa";
import { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import AdminOverview from "./AdminOverview";
import AdminUsersList from "./AdminUsersList";
import AdminCaptainsList from "./AdminCaptainsList";
import AdminContactsList from "./AdminContactsList";
import AdminRidesList from "./AdminRidesList";
import AdminHeaderLinks from "./AdminHeaderLinks";
import AdminPageContentManager from "./AdminPageContentManager";
import AdminChatPanel from "./AdminChatPanel";
import AdminLiveMap from "./AdminLiveMap";
import AdminActiveCaptains from "./AdminActiveCaptains";
import { useNavigate } from "react-router-dom";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeTabMeta, setActiveTabMeta] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [captainsDropdownOpen, setCaptainsDropdownOpen] = useState(true);
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Helper: setActiveTab with optional meta (e.g. vehicle filter)
  const goToTab = (tab, meta = null) => {
    setActiveTab(tab);
    setActiveTabMeta(meta);
  };

  const isCaptainsActive = ["captains", "pending-captains", "approved-captains", "rejected-captains"].includes(activeTab);
  const isCollapsed = collapsed && !sidebarHover;
  const shouldShowBackButton = activeTab !== 'overview';

  const adminName = localStorage.getItem('adminName') || 'Admin';
  const adminEmail = localStorage.getItem('adminEmail') || '';

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin-login');
  }, [navigate]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to log out of the Admin Dashboard?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f9c935',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        localStorage.removeItem('adminEmail');
        navigate("/admin-login");
      }
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview setActiveTab={setActiveTab} />;
      case "users":
        return <AdminUsersList />;
      case "captains":
        return <AdminCaptainsList />;
      case "pending-captains":
        return <AdminCaptainsList statusFilter="pending" />;
      case "approved-captains":
        return <AdminCaptainsList statusFilter="approved" />;
      case "rejected-captains":
        return <AdminCaptainsList statusFilter="rejected" />;
      case "rides":
        return <AdminRidesList />;
      case "bike":
        return <AdminRidesList category="bike" />;
      case 'auto':
        return <AdminRidesList category="auto" />;
      case 'cab':
        return <AdminRidesList category="cab" />;
      case 'completed':
        return <AdminRidesList statusFilter="completed" />;
      case 'cancelled':
        return <AdminRidesList statusFilter="cancelled" />;
      case 'contacts':
        return <AdminContactsList />;
      case 'header-links':
        return <AdminHeaderLinks />;
      case 'page-content':
        return <AdminPageContentManager />;
      case 'chat':
        return <AdminChatPanel />;
      case 'live-map':
        return <AdminLiveMap />;
      case 'active-captains':
        return <AdminActiveCaptains defaultVehicle={activeTabMeta || 'all'} />;
      default:
        return <AdminOverview />;
    }
  };

  const handleBack = () => setActiveTab('overview');

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setSidebarHover(true);
  };

  const handleMouseLeave = () => {
    // small delay to avoid flicker when moving between items
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarHover(false);
      hoverTimeoutRef.current = null;
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className={`dashboard-layout ${collapsed ? "collapsed" : ""} ${sidebarHover ? "hovered" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Toaster position="top-right" />
      {/* Sidebar */}
      <aside
        className="sidebar"
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        <div className="logo-container">
          {!collapsed && <h2 className="logo-text" style={{ fontSize: '1.2rem' }}>Admin Dashboard</h2>}
          {collapsed && <FaUserShield className="logo-icon" size={24} color="var(--primary)" />}
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: collapsed ? '0' : 'auto', marginTop: collapsed ? '1rem' : '0' }}>
            <FaBars />
          </button>
        </div>

        <ul className="menu">
          <li
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <FaThLarge className="menu-icon" />
            <span className="menu-text">Overview</span>
          </li>
          <li
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            <FaUsers className="menu-icon" />
            <span className="menu-text">Users</span>
          </li>
          <li className={isCaptainsActive ? "active dropdown-toggle" : "dropdown-toggle"}>
            <div className="dropdown-header" onClick={() => setCaptainsDropdownOpen((o) => !o)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <FaCar className="menu-icon" />
                <span className="menu-text">Captains</span>
              </div>
              <FaChevronDown className={`dropdown-arrow ${captainsDropdownOpen ? 'open' : ''}`} />
            </div>
            {captainsDropdownOpen && (
              <ul className="submenu">
                <li className={activeTab === "captains" ? "active" : ""} onClick={() => goToTab("captains")}>All Captains</li>
                <li className={activeTab === "pending-captains" ? "active" : ""} onClick={() => goToTab("pending-captains")}>Pending Approvals</li>
                <li className={activeTab === "approved-captains" ? "active" : ""} onClick={() => goToTab("approved-captains")}>Approved Captains</li>
                <li className={activeTab === "rejected-captains" ? "active" : ""} onClick={() => goToTab("rejected-captains")}>Rejected Captains</li>
              </ul>
            )}
          </li>
          <li
            className={activeTab === "rides" ? "active" : ""}
            onClick={() => setActiveTab("rides")}
          >
            <FaRoute className="menu-icon" />
            <span className="menu-text">All Rides</span>
          </li>
          <li
            className={activeTab === "bike" ? "active" : ""}
            onClick={() => setActiveTab("bike")}
          >
            <FaMotorcycle className="menu-icon" />
            <span className="menu-text">TaxiNova Bike</span>
          </li>
          <li
            className={activeTab === "auto" ? "active" : ""}
            onClick={() => setActiveTab("auto")}
          >
            <FaCar className="menu-icon" />
            <span className="menu-text">TaxiNova Auto</span>
          </li>
          <li
            className={activeTab === "cab" ? "active" : ""}
            onClick={() => setActiveTab("cab")}
          >
            <FaTaxi className="menu-icon" />
            <span className="menu-text">TaxiNova Cab</span>
          </li>
          <li
            className={activeTab === "completed" ? "active" : ""}
            onClick={() => setActiveTab("completed")}
          >
            <FaRoute className="menu-icon" style={{ color: '#10b981' }} />
            <span className="menu-text">Completed Rides</span>
          </li>
          <li
            className={activeTab === "cancelled" ? "active" : ""}
            onClick={() => setActiveTab("cancelled")}
          >
            <FaRoute className="menu-icon" style={{ color: '#ef4444' }} />
            <span className="menu-text">Cancelled Rides</span>
          </li>
          <li
            className={activeTab === "contacts" ? "active" : ""}
            onClick={() => setActiveTab("contacts")}
          >
            <FaEnvelope className="menu-icon" />
            <span className="menu-text">Contact Inquiries</span>
          </li>
          <li
            className={activeTab === "header-links" ? "active" : ""}
            onClick={() => setActiveTab("header-links")}
          >
            <FaClipboardList className="menu-icon" style={{ color: '#8b5cf6' }} />
            <span className="menu-text">Header Navigation</span>
          </li>
          <li
            className={activeTab === "page-content" ? "active" : ""}
            onClick={() => setActiveTab("page-content")}
          >
            <FaClipboardList className="menu-icon" style={{ color: '#22c55e' }} />
            <span className="menu-text">Page Content</span>
          </li>
          <li
            className={activeTab === "chat" ? "active" : ""}
            onClick={() => setActiveTab("chat")}
          >
            <FaComments className="menu-icon" style={{ color: '#3b82f6' }} />
            <span className="menu-text">Captain Chat</span>
          </li>
          <li
            className={activeTab === "live-map" ? "active" : ""}
            onClick={() => setActiveTab("live-map")}
          >
            <FaMapMarkedAlt className="menu-icon" style={{ color: '#22c55e' }} />
            <span className="menu-text">Live Map</span>
          </li>
          <li
            className={activeTab === "active-captains" ? "active" : ""}
            onClick={() => setActiveTab("active-captains")}
          >
            <FaCar className="menu-icon" style={{ color: '#22c55e' }} />
            <span className="menu-text">Active Captains</span>
          </li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="menu-icon" />
          <span className="menu-text">Exit Admin</span>
        </button>
      </aside>

      {/* Content Area */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-left">
            {shouldShowBackButton && (
              <button className="back-button" onClick={handleBack}>
                ← Back
              </button>
            )}
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/-/g, ' ')} Dashboard</h1>
          </div>
          <div className="admin-profile" ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              className="avatar"
              onClick={() => setDropdownOpen(o => !o)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Admin Profile"
            >
              {adminName?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="profile-label" onClick={() => setDropdownOpen(o => !o)}>{adminName}</span>

            {dropdownOpen && (
              <div className="profile-menu">
                <div className="profile-menu-card">
                  <div className="profile-menu-card-header">
                    <div className="profile-menu-card-avatar">{adminName?.[0]?.toUpperCase()}</div>
                    <div className="profile-menu-card-info">
                      <div className="profile-menu-card-name">{adminName}</div>
                      <div className="profile-menu-card-email">{adminEmail}</div>
                    </div>
                  </div>
                  <div className="profile-menu-badge">Super Admin</div>
                  <button className="profile-menu-logout" onClick={handleLogout}>
                    <FaSignOutAlt size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
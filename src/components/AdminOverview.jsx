import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers, FaCar, FaEnvelope, FaRoute, FaCheckCircle, FaTimesCircle, FaClock, FaMotorcycle, FaTaxi, FaMapMarkedAlt } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import AdminLiveMap from './AdminLiveMap';
import { API_URL } from '../api.js';

const S = {
  wrap: {
    padding: '0',
    background: 'transparent',
  },
  // Welcome banner
  banner: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    borderRadius: '20px',
    padding: '2rem 2.5rem',
    marginBottom: '1.75rem',
    border: '1px solid rgba(99,102,241,0.2)',
    boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerGlow: {
    position: 'absolute', top: '-60px', right: '-60px',
    width: '200px', height: '200px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  bannerTitle: { fontSize: '1.6rem', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.02em' },
  bannerSub: { fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' },
  bannerBadge: {
    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
    color: '#a5b4fc', padding: '0.4rem 1rem', borderRadius: '100px',
    fontSize: '0.78rem', fontWeight: '700',
  },
  // Section label
  sectionLabel: {
    fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.9rem', marginTop: '0.25rem',
  },
  // Main stat cards
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' },
  mainCard: (color1, color2, shadow) => ({
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
    borderRadius: '16px', padding: '1.4rem 1.5rem',
    cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: `0 6px 20px ${shadow}`,
    border: 'none', display: 'flex', alignItems: 'center', gap: '1rem',
  }),
  mainCardIcon: {
    width: '52px', height: '52px', borderRadius: '14px',
    background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.4rem', color: '#fff', flexShrink: 0,
  },
  mainCardLabel: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: '600', margin: 0 },
  mainCardValue: { fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '0.2rem 0 0', lineHeight: 1 },
  // Sub stat cards
  subGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '0.9rem', marginBottom: '1.75rem' },
  subCard: (accent) => ({
    background: '#fff',
    border: `1px solid #e2e8f0`,
    borderLeft: `4px solid ${accent}`,
    borderRadius: '12px', padding: '1.1rem 1.25rem',
    cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  }),
  subCardLabel: { fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 },
  subCardValue: (color) => ({ fontSize: '1.75rem', fontWeight: '800', color, margin: '0.3rem 0 0', lineHeight: 1 }),
  // Charts
  chartBox: {
    background: '#fff', borderRadius: '16px', padding: '1.5rem',
    border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  chartTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.25rem' },
  chartsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '1rem', marginBottom: '1rem' },
};

const AdminOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalCaptains: 0, totalContacts: 0, activeCaptains: 0,
    onlineBike: 0, onlineAuto: 0, onlineCab: 0,
    totalRides: 0, bikeRides: 0, autoRides: 0, cabRides: 0,
    completedRides: 0, cancelledRides: 0,
    pendingCaptains: 0, approvedCaptains: 0, rejectedCaptains: 0,
    totalCommission: 0, totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    setGraphData(days.map(d => ({
      name: d,
      rides: Math.floor(Math.random() * 50) + 10,
      signups: Math.floor(Math.random() * 20) + 5,
      visitors: Math.floor(Math.random() * 500) + 100,
    })));
    axios.get(`${API_URL}/api/admin/stats`)
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const adminName = localStorage.getItem('adminName') || 'Admin';

  const PIE_COLORS = ['#f59e0b', '#10b981', '#ef4444'];
  const captainApprovalData = [
    { name: 'Pending', value: stats.pendingCaptains || 0 },
    { name: 'Approved', value: stats.approvedCaptains || 0 },
    { name: 'Rejected', value: stats.rejectedCaptains || 0 },
  ];
  const rideTypeData = [
    { name: 'Bike', value: stats.bikeRides || 0 },
    { name: 'Auto', value: stats.autoRides || 0 },
    { name: 'Cab', value: stats.cabRides || 0 },
  ];
  const RIDE_COLORS = ['#f59e0b', '#10b981', '#3b82f6'];

  const hover = (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)'; };
  const unhover = (e, shadow = '0 2px 8px rgba(0,0,0,0.04)') => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = shadow; };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#64748b', fontSize: '1rem', gap: '0.5rem' }}>
      <div style={{ width: 20, height: 20, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading stats...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={S.wrap}>

      {/* ── Welcome Banner ── */}
      <div style={S.banner}>
        <div style={S.bannerGlow} />
        <div>
          <div style={S.bannerTitle}>Welcome back, {adminName} 👋</div>
          <div style={S.bannerSub}>Here's what's happening on TaxiNova today</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={S.bannerBadge}>🟢 {stats.activeCaptains} Online Captains</span>
          <span style={{ ...S.bannerBadge, background: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)', color: '#fcd34d' }}>
            ⏳ {stats.pendingCaptains} Pending
          </span>
        </div>
      </div>

      {/* ── Main Stats ── */}
      <div style={S.sectionLabel}>Platform Overview</div>
      <div style={S.mainGrid}>
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: <FaUsers />, c1: '#3b82f6', c2: '#1d4ed8', sh: 'rgba(59,130,246,0.25)', tab: 'users' },
          { label: 'Online Captains', value: stats.activeCaptains, icon: <FaCar />, c1: '#22c55e', c2: '#16a34a', sh: 'rgba(34,197,94,0.25)', tab: 'active-captains' },
          { label: 'Total Rides', value: stats.totalRides, icon: <FaRoute />, c1: '#10b981', c2: '#059669', sh: 'rgba(16,185,129,0.25)', tab: 'rides' },
          { label: 'Contacts', value: stats.totalContacts, icon: <FaEnvelope />, c1: '#8b5cf6', c2: '#6d28d9', sh: 'rgba(139,92,246,0.25)', tab: 'contacts' },
        ].map((c, i) => (
          <div key={i} style={S.mainCard(c.c1, c.c2, c.sh)} onClick={() => setActiveTab(c.tab)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 16px 32px ${c.sh.replace('0.25', '0.4')}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 20px ${c.sh}`; }}
          >
            <div style={S.mainCardIcon}>{c.icon}</div>
            <div>
              <div style={S.mainCardLabel}>{c.label}</div>
              <div style={S.mainCardValue}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Commission Stats ── */}
      <div style={S.sectionLabel}>Revenue & Commission (8% per ride)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(99,102,241,0.15)' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>💰 Total Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff' }}>₹{stats.totalRevenue || 0}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem' }}>From all completed rides</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#14532d,#166534)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(34,197,94,0.15)' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>🏦 Admin Commission (8%)</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#4ade80' }}>₹{stats.totalCommission || 0}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem' }}>8% of ₹{stats.totalRevenue || 0}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#7c2d12,#9a3412)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(251,146,60,0.15)' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>🏍️ Captain Earnings (92%)</div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fb923c' }}>₹{Math.round((stats.totalRevenue || 0) - (stats.totalCommission || 0))}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem' }}>92% paid to captains</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #6366f1', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>📊 Commission Rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#6366f1' }}>8%</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.3rem' }}>Fixed per completed ride</div>
        </div>
      </div>

      {/* ── Online Captains Breakdown ── */}
      <div style={S.sectionLabel}>Currently Online Captains</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Online',     value: stats.activeCaptains,                          color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',   sub: `of ${stats.totalCaptains} total`, tab: 'active-captains' },
          { label: '🏍️ Bikes Online',  value: stats.onlineBike,                              color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', sub: 'Bike captains',              tab: 'active-captains' },
          { label: '🛺 Autos Online',  value: stats.onlineAuto,                              color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', sub: 'Auto captains',              tab: 'active-captains' },
          { label: '🚗 Cabs Online',   value: stats.onlineCab,                               color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)',  sub: 'Cab captains',               tab: 'active-captains' },
          { label: 'Offline Captains', value: stats.totalCaptains - stats.activeCaptains,    color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)',  sub: 'Not available',              tab: 'captains' },
        ].map((c, i) => (
          <div key={i} onClick={() => setActiveTab(c.tab)} style={{
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: '14px', padding: '1.1rem 1.25rem',
            cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{c.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Captain Approvals ── */}
      <div style={S.sectionLabel}>Captain Approvals</div>
      <div style={S.subGrid}>
        {[
          { label: 'Pending Approvals', value: stats.pendingCaptains, color: '#f59e0b', accent: '#f59e0b', tab: 'pending-captains', icon: <FaClock size={14} /> },
          { label: 'Approved Captains', value: stats.approvedCaptains, color: '#10b981', accent: '#10b981', tab: 'approved-captains', icon: <FaCheckCircle size={14} /> },
          { label: 'Rejected Apps', value: stats.rejectedCaptains, color: '#ef4444', accent: '#ef4444', tab: 'rejected-captains', icon: <FaTimesCircle size={14} /> },
        ].map((c, i) => (
          <div key={i} style={S.subCard(c.accent)} onClick={() => setActiveTab(c.tab)}
            onMouseEnter={hover} onMouseLeave={unhover}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: c.color, marginBottom: '0.4rem' }}>
              {c.icon}
              <span style={S.subCardLabel}>{c.label}</span>
            </div>
            <div style={S.subCardValue(c.color)}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* ── Rides by Category ── */}
      <div style={S.sectionLabel}>Rides by Category</div>
      <div style={S.subGrid}>
        {[
          { label: 'Bike Rides', value: stats.bikeRides, color: '#f59e0b', accent: '#f59e0b', tab: 'bike', icon: <FaMotorcycle size={14} /> },
          { label: 'Auto Rides', value: stats.autoRides, color: '#10b981', accent: '#10b981', tab: 'auto', icon: <FaCar size={14} /> },
          { label: 'Cab Rides', value: stats.cabRides, color: '#3b82f6', accent: '#3b82f6', tab: 'cab', icon: <FaTaxi size={14} /> },
          { label: 'Completed', value: stats.completedRides, color: '#10b981', accent: '#10b981', tab: 'completed', icon: <FaCheckCircle size={14} /> },
          { label: 'Cancelled', value: stats.cancelledRides, color: '#ef4444', accent: '#ef4444', tab: 'cancelled', icon: <FaTimesCircle size={14} /> },
        ].map((c, i) => (
          <div key={i} style={S.subCard(c.accent)} onClick={() => setActiveTab(c.tab)}
            onMouseEnter={hover} onMouseLeave={unhover}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: c.color, marginBottom: '0.4rem' }}>
              {c.icon}
              <span style={S.subCardLabel}>{c.label}</span>
            </div>
            <div style={S.subCardValue(c.color)}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* ── Live Map Section ── */}
      <div style={{ ...S.sectionLabel, marginTop: '1.5rem' }}>🗺️ Live Captain & Ride Map</div>
      <AdminLiveMap />

      {/* ── Charts Row ── */}
      <div style={S.sectionLabel}>Analytics</div>
      <div style={{ ...S.chartsRow, gridTemplateColumns: '1fr 1fr' }}>
        {/* Area Chart */}
        <div style={S.chartBox}>
          <div style={S.chartTitle}>📈 Platform Activity — Last 7 Days</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={graphData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gRides" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }} />
              <Area type="monotone" dataKey="rides" stroke="#3b82f6" strokeWidth={2} fill="url(#gRides)" name="Rides" />
              <Area type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={2} fill="url(#gSignups)" name="Signups" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div style={S.chartBox}>
          <div style={S.chartTitle}>👥 Site Visitors Traffic</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={graphData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }} />
              <Bar dataKey="visitors" fill="#8b5cf6" name="Visitors" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Pie Charts ── */}
      <div style={{ ...S.chartsRow, marginTop: '1rem' }}>
        <div style={S.chartBox}>
          <div style={S.chartTitle}>🏍️ Rides by Vehicle Type</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={rideTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {rideTypeData.map((_, i) => <Cell key={i} fill={RIDE_COLORS[i]} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }} />
              <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={S.chartBox}>
          <div style={S.chartTitle}>✅ Captain Approval Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={captainApprovalData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {captainApprovalData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }} />
              <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={S.chartBox}>
          <div style={S.chartTitle}>🚦 Ride Completion Rate</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Completed', value: stats.completedRides || 0 },
                  { name: 'Cancelled', value: stats.cancelledRides || 0 },
                  { name: 'Pending', value: Math.max((stats.totalRides - stats.completedRides - stats.cancelledRides), 0) },
                ]}
                cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}
              >
                {['#10b981', '#ef4444', '#94a3b8'].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }} />
              <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;

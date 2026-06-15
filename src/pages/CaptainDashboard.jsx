import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Clock, ShieldCheck, XCircle, Phone, CheckCircle,
  TrendingUp, MapPin, Navigation, User, Zap,
  AlertTriangle, BarChart2, LogOut, RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import './CaptainDashboard.css';

const VEHICLE_ICONS = { bike: '🏍️', auto: '🛺', cab: '🚗' };

const CaptainDashboard = () => {
  const [pendingRides, setPendingRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [activeTab, setActiveTab] = useState('rides');
  const [stats, setStats] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { token, user, authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchPendingRides = useCallback(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/rides/pending', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => Array.isArray(d) && setPendingRides(d))
      .catch(() => {});
  }, [token]);

  const fetchStats = useCallback(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/captains/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, [token]);

  const fetchActiveRide = useCallback(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/rides/active', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => d.activeRide && setActiveRide(d.activeRide))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'captain') { navigate('/'); return; }
    fetchPendingRides();
    fetchActiveRide();
    fetchStats();
    const id = setInterval(fetchPendingRides, 4000);
    return () => clearInterval(id);
  }, [token, user, navigate, authLoading, fetchPendingRides, fetchActiveRide, fetchStats]);

  const acceptRide = async (rideId) => {
    try {
      const res = await fetch('http://localhost:5000/api/rides/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rideId })
      });
      const data = await res.json();
      if (res.ok) { setActiveRide(data.ride); setActiveTab('active'); }
      else Swal.fire('Error', data.message, 'error');
    } catch { Swal.fire('Error', 'Network error', 'error'); }
  };

  const updateStatus = async (status, otp = null) => {
    try {
      const payload = { rideId: activeRide._id, status };
      if (otp) payload.otp = otp;
      const res = await fetch('http://localhost:5000/api/rides/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) { setActiveRide(data.ride); fetchStats(); }
      else Swal.fire('Error', data.message || 'Failed to update status', 'error');
    } catch { Swal.fire('Error', 'Network error', 'error'); }
  };

  const handleStartRide = async () => {
    const { value: otp } = await Swal.fire({
      title: '🔐 Verify OTP',
      html: '<p style="color:#888;font-size:0.9rem">Ask the passenger for their 4-digit OTP</p>',
      input: 'text',
      inputPlaceholder: 'Enter 4-digit OTP',
      showCancelButton: true,
      confirmButtonColor: '#FFD700',
      confirmButtonText: 'Verify & Start',
      cancelButtonText: 'Cancel',
      background: '#141414',
      color: '#fff',
      inputAttributes: { maxlength: 4, style: 'text-align:center;font-size:1.5rem;letter-spacing:0.3em;background:#1A1A1A;color:#fff;border:1px solid #333;border-radius:8px;padding:0.75rem' },
      inputValidator: v => !v && 'Please enter the OTP'
    });
    if (otp) updateStatus('ongoing', otp);
  };

  const handleCaptainCancel = async () => {
    const { value: reason } = await Swal.fire({
      title: '⚠️ Cancel Ride?',
      html: '<p style="color:#888;font-size:0.9rem">Please provide a reason for cancellation</p>',
      input: 'select',
      inputOptions: {
        'Passenger not at pickup': 'Passenger not at pickup',
        'Passenger misbehaviour': 'Passenger misbehaviour',
        'Vehicle breakdown': 'Vehicle breakdown',
        'Emergency': 'Emergency',
        'Other': 'Other reason'
      },
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Cancel Ride',
      cancelButtonText: 'Go Back',
      background: '#141414',
      color: '#fff',
      inputValidator: v => !v && 'Please select a reason'
    });

    if (!reason) return;
    setCancelling(true);
    try {
      const res = await fetch('http://localhost:5000/api/rides/captain-cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rideId: activeRide._id, cancelReason: reason })
      });
      const data = await res.json();
      if (res.ok) {
        await Swal.fire({
          title: 'Ride Cancelled',
          text: 'The ride has been cancelled and the passenger has been notified.',
          icon: 'info',
          confirmButtonColor: '#FFD700',
          background: '#141414',
          color: '#fff'
        });
        setActiveRide(null);
        setActiveTab('rides');
        fetchStats();
      } else {
        Swal.fire('Error', data.message || 'Failed to cancel', 'error');
      }
    } catch {
      Swal.fire('Error', 'Network error', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'You will be signed out of your captain account.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Logout',
      background: '#141414',
      color: '#fff'
    }).then(r => { if (r.isConfirmed) { logout(); navigate('/'); } });
  };

  // ── Loading ──
  if (authLoading) {
    return (
      <div className="cap-loading">
        <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
        Loading dashboard...
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (!user || user.role !== 'captain') return null;

  // ── Pending Approval ──
  if (user.approvalStatus === 'pending') {
    return (
      <div className="cap-dash">
        <div className="cap-status-screen">
          <div className="cap-status-card">
            <div className="cap-status-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <Clock size={36} color="#F59E0B" />
            </div>
            <h2 className="cap-status-title">Under Review</h2>
            <p className="cap-status-desc">
              Hey <strong style={{ color: '#fff' }}>{user.name}</strong>! Your captain profile is being reviewed by our team. We'll notify you once approved — usually within 2 hours.
            </p>
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#1A1A1A', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #222' }}>
              <ShieldCheck size={20} color="#22C55E" />
              <span style={{ fontSize: '0.85rem', color: '#888' }}>Verification in progress — sit tight!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Rejected ──
  if (user.approvalStatus === 'rejected') {
    return (
      <div className="cap-dash">
        <div className="cap-status-screen">
          <div className="cap-status-card">
            <div className="cap-status-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <XCircle size={36} color="#EF4444" />
            </div>
            <h2 className="cap-status-title" style={{ color: '#EF4444' }}>Application Rejected</h2>
            <p className="cap-status-desc">
              Sorry <strong style={{ color: '#fff' }}>{user.name}</strong>, your application was not approved. Please contact our support team for more details.
            </p>
            <button onClick={handleLogout} className="btn-cancel-ride" style={{ marginTop: '2rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ──
  const tabs = [
    { id: 'rides', label: 'Ride Requests', icon: <Zap size={15} />, badge: pendingRides.length },
    { id: 'active', label: 'Active Ride', icon: <MapPin size={15} />, badge: activeRide ? 1 : 0 },
    { id: 'stats', label: 'Performance', icon: <BarChart2 size={15} /> },
  ];

  return (
    <div className="cap-dash">
      {/* Header */}
      <div className="cap-header">
        <div className="cap-header-left">
          <div className="cap-avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="cap-name">{user.name}</div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span className="cap-vehicle-badge">{VEHICLE_ICONS[user.vehicleType]} {user.vehicleType}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className={`cap-online-toggle ${isOnline ? 'online' : ''}`}
            onClick={() => setIsOnline(o => !o)}
          >
            <span className="cap-online-dot" />
            {isOnline ? 'Online' : 'Offline'}
          </button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="cap-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`cap-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {t.badge > 0 && <span className="cap-tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="cap-content">

        {/* ── Ride Requests Tab ── */}
        {activeTab === 'rides' && (
          <>
            {!isOnline ? (
              <div className="cap-empty">
                <div className="cap-empty-icon">📴</div>
                <div className="cap-empty-title">You are Offline</div>
                <div className="cap-empty-sub">Go online to start receiving ride requests</div>
              </div>
            ) : pendingRides.length === 0 ? (
              <div className="cap-empty">
                <div className="cap-empty-icon">🛣️</div>
                <div className="cap-empty-title">No Ride Requests</div>
                <div className="cap-empty-sub">Waiting for new requests in your area...</div>
              </div>
            ) : (
              <div className="rides-grid">
                {pendingRides.map(ride => (
                  <div key={ride._id} className="ride-card">
                    <div className="ride-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="ride-vehicle-icon">{VEHICLE_ICONS[ride.vehicleType] || '🚗'}</span>
                        <span style={{ fontSize: '0.75rem', color: '#555', fontWeight: '600', textTransform: 'capitalize' }}>{ride.vehicleType}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="ride-fare">₹{ride.fare}</div>
                        <div className="ride-fare-label">Estimated fare</div>
                      </div>
                    </div>

                    <div className="ride-card-body">
                      {/* Route */}
                      <div className="ride-route">
                        <div className="ride-route-item">
                          <div className="route-icon-wrap">
                            <div className="route-dot-green" />
                            <div className="route-line-connector" />
                          </div>
                          <div>
                            <div className="route-label">Pickup</div>
                            <div className="route-text">{ride.pickup}</div>
                          </div>
                        </div>
                        <div className="ride-route-item" style={{ marginTop: '0' }}>
                          <div className="route-icon-wrap">
                            <div className="route-dot-red" />
                          </div>
                          <div>
                            <div className="route-label">Drop</div>
                            <div className="route-text">{ride.dropoff}</div>
                          </div>
                        </div>
                      </div>

                      {/* Passenger */}
                      {ride.user && (
                        <div className="ride-user-row">
                          <div className="ride-user-avatar"><User size={14} /></div>
                          <div>
                            <div className="ride-user-name">{ride.user.name || 'Passenger'}</div>
                            <div className="ride-user-phone">{ride.user.phone || ''}</div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="ride-card-actions">
                        <button className="btn-accept" onClick={() => acceptRide(ride._id)}>
                          <CheckCircle size={16} /> Accept Ride
                        </button>
                        <button className="btn-decline" title="Decline">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Active Ride Tab ── */}
        {activeTab === 'active' && (
          <>
            {!activeRide ? (
              <div className="cap-empty">
                <div className="cap-empty-icon">✅</div>
                <div className="cap-empty-title">No Active Ride</div>
                <div className="cap-empty-sub">Accept a ride request to see it here</div>
              </div>
            ) : (
              <div className="active-ride-panel">
                {/* Header */}
                <div className="active-ride-header">
                  <div className="active-status-pill">
                    <span className="active-status-dot" />
                    <span style={{ color: '#FFD700' }}>
                      {activeRide.status === 'accepted' ? 'Heading to Pickup' :
                        activeRide.status === 'ongoing' ? 'Ride in Progress' :
                          activeRide.status === 'completed' ? 'Ride Completed' : activeRide.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>{VEHICLE_ICONS[activeRide.vehicleType] || '🚗'}</span>
                </div>

                <div className="active-ride-body">
                  {/* Route */}
                  <div className="active-route-card">
                    <div className="active-route-row">
                      <div className="active-route-icon pickup"><MapPin size={14} /></div>
                      <div>
                        <div className="active-route-label">Pickup</div>
                        <div className="active-route-value">{activeRide.pickup}</div>
                      </div>
                    </div>
                    <div className="active-route-divider" />
                    <div className="active-route-row">
                      <div className="active-route-icon dropoff"><Navigation size={14} /></div>
                      <div>
                        <div className="active-route-label">Drop</div>
                        <div className="active-route-value">{activeRide.dropoff}</div>
                      </div>
                    </div>
                  </div>

                  {/* Passenger */}
                  {activeRide.user && (
                    <div className="active-passenger-card">
                      <div className="active-passenger-info">
                        <div className="active-passenger-avatar">👤</div>
                        <div>
                          <div className="active-passenger-name">{activeRide.user.name}</div>
                          <div className="active-passenger-phone">{activeRide.user.phone}</div>
                        </div>
                      </div>
                      <a href={`tel:${activeRide.user.phone}`} className="active-call-btn">
                        <Phone size={16} />
                      </a>
                    </div>
                  )}

                  {/* Fare */}
                  <div className="active-fare-row">
                    <div>
                      <div className="active-fare-label">Fare</div>
                      <div className="active-fare-value">₹{activeRide.fare}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="active-fare-label">Payment</div>
                      <div className="active-fare-method">{activeRide.paymentMethod || 'Cash'}</div>
                    </div>
                  </div>

                  {/* OTP (only when accepted, before starting) */}
                  {activeRide.status === 'accepted' && activeRide.otp && (
                    <div className="otp-box">
                      <div className="otp-label">🔐 Ride OTP — Ask passenger to share</div>
                      <div className="otp-value">{activeRide.otp}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="active-actions">
                    {activeRide.status === 'accepted' && (
                      <button className="btn-start-ride" onClick={handleStartRide}>
                        <Zap size={18} /> Start Ride
                      </button>
                    )}
                    {activeRide.status === 'ongoing' && (
                      <button className="btn-complete-ride" onClick={() => updateStatus('completed')}>
                        <CheckCircle size={18} /> Complete Ride
                      </button>
                    )}
                    {activeRide.status === 'completed' && (
                      <button className="btn-payment-done" onClick={() => { setActiveRide(null); setActiveTab('rides'); fetchStats(); }}>
                        <CheckCircle size={18} /> Payment Collected — Done
                      </button>
                    )}

                    {/* Cancel button — only when accepted or ongoing */}
                    {['accepted', 'ongoing'].includes(activeRide.status) && (
                      <button className="btn-cancel-ride" onClick={handleCaptainCancel} disabled={cancelling}>
                        <AlertTriangle size={16} />
                        {cancelling ? 'Cancelling...' : 'Cancel This Ride'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Stats Tab ── */}
        {activeTab === 'stats' && (
          <div>
            {!stats ? (
              <div className="cap-empty">
                <div className="cap-empty-icon">📊</div>
                <div className="cap-empty-title">Loading stats...</div>
              </div>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-label">Total Rides</div>
                    <div className="stat-card-value" style={{ color: '#3B82F6' }}>{stats.totalRides || 0}</div>
                    <div className="stat-card-sub">All time</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Completed</div>
                    <div className="stat-card-value" style={{ color: '#22C55E' }}>{stats.completedRides || 0}</div>
                    <div className="stat-card-sub">Successfully done</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Cancelled</div>
                    <div className="stat-card-value" style={{ color: '#EF4444' }}>{stats.cancelledRides || 0}</div>
                    <div className="stat-card-sub">By you or passenger</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-label">Missed</div>
                    <div className="stat-card-value" style={{ color: '#F59E0B' }}>{stats.missedRides || 0}</div>
                    <div className="stat-card-sub">Not accepted in time</div>
                  </div>
                </div>

                <div className="earnings-card">
                  <div>
                    <div className="earnings-label">Total Earnings</div>
                    <div className="earnings-amount">₹{stats.totalEarnings || 0}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="earnings-label">Performance</div>
                    <div className={`performance-badge`} style={
                      stats.dailyPerformance === 'Excellent'
                        ? { background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }
                        : stats.dailyPerformance === 'Good'
                          ? { background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }
                          : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }
                    }>
                      {stats.dailyPerformance || 'N/A'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CaptainDashboard;

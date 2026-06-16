import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaRoute, FaMoneyBillWave, FaStar, FaTimesCircle, FaCheckCircle, FaClock, FaArrowRight } from 'react-icons/fa';
import { API_URL } from '../api.js';

const CaptainOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API_URL}/api/captains/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/api/captains/ride-history`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([s, h]) => {
      setStats(s);
      setRecentRides(Array.isArray(h) ? h.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="cdl-loading">Loading dashboard...</div>;

  const cards = [
    { label: 'Total Rides',    value: stats?.totalRides || 0,      icon: <FaRoute />,        color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  sub: 'All time' },
    { label: 'Completed',      value: stats?.completedRides || 0,  icon: <FaCheckCircle />,  color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   sub: 'Successfully done' },
    { label: 'Cancelled',      value: stats?.cancelledRides || 0,  icon: <FaTimesCircle />,  color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   sub: 'By you or passenger' },
    { label: 'Missed',         value: stats?.missedRides || 0,     icon: <FaClock />,        color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  sub: 'Not accepted in time' },
    { label: 'Total Earnings', value: `₹${stats?.totalEarnings || 0}`, icon: <FaMoneyBillWave />, color: '#FFD700', bg: 'rgba(255,215,0,0.1)', sub: 'All time earnings' },
    { label: 'Rating',         value: user?.rating || '5.0',       icon: <FaStar />,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  sub: 'Average rating' },
  ];

  const perfColor = stats?.dailyPerformance === 'Excellent' ? '#22C55E' : stats?.dailyPerformance === 'Good' ? '#3B82F6' : '#F59E0B';
  const perfBg    = stats?.dailyPerformance === 'Excellent' ? 'rgba(34,197,94,0.1)' : stats?.dailyPerformance === 'Good' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)';

  return (
    <div>
      {/* Banner */}
      <div className="cdl-earnings-banner" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="cdl-earnings-lbl">Performance</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
            {stats?.dailyPerformance === 'Excellent' ? '🔥' : stats?.dailyPerformance === 'Good' ? '👍' : '💪'} {stats?.dailyPerformance || 'Keep Going'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '0.25rem' }}>{stats?.completedRides || 0} rides completed overall</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="cdl-earnings-lbl">Total Earnings</div>
          <div className="cdl-earnings-big">₹{stats?.totalEarnings || 0}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="cdl-stats-grid">
        {cards.map((c, i) => (
          <div key={i} className="cdl-stat-card">
            <div className="cdl-stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div>
              <div className="cdl-stat-label">{c.label}</div>
              <div className="cdl-stat-value" style={{ color: c.color }}>{c.value}</div>
              <div className="cdl-stat-sub">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Rides */}
      <div className="cdl-table-box">
        <div className="cdl-table-head">
          <span className="cdl-table-title">Recent Rides</span>
          <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', color: '#FFD700', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <FaArrowRight size={11} />
          </button>
        </div>
        {recentRides.length === 0 ? (
          <div className="cdl-empty"><div className="ei">🛣️</div><div className="et">No rides yet</div><div className="es">Your completed rides will appear here</div></div>
        ) : (
          <div className="cdl-table-wrap">
            <table className="cdl-table">
              <thead>
                <tr>
                  <th>Passenger</th><th>Pickup</th><th>Drop</th><th>Fare</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map(ride => (
                  <tr key={ride._id}>
                    <td>{ride.user?.name || 'N/A'}</td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ride.pickup}</td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ride.dropoff}</td>
                    <td style={{ color: '#FFD700', fontWeight: '700' }}>₹{ride.fare}</td>
                    <td><span className={`cdl-badge ${ride.status}`}>{ride.status}</span></td>
                    <td style={{ color: '#555' }}>{new Date(ride.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptainOverview;

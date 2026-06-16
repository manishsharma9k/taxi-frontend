import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaMoneyBillWave, FaRoute, FaChartLine, FaStar } from 'react-icons/fa';
import { API_URL } from '../api.js';

const CaptainEarnings = () => {
  const [stats, setStats] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API_URL}/api/captains/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/api/captains/ride-history`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([s, h]) => {
      setStats(s);
      setRides(Array.isArray(h) ? h.filter(r => r.status === 'completed') : []);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="cdl-loading">Loading earnings...</div>;

  // Per-vehicle breakdown
  const vehicleBreakdown = rides.reduce((acc, r) => {
    const v = r.vehicleType || 'unknown';
    if (!acc[v]) acc[v] = { count: 0, total: 0 };
    acc[v].count++;
    acc[v].total += Number(r.fare) || 0;
    return acc;
  }, {});

  const perfColor = stats?.dailyPerformance === 'Excellent' ? '#22C55E' : stats?.dailyPerformance === 'Good' ? '#3B82F6' : '#F59E0B';
  const perfBg    = stats?.dailyPerformance === 'Excellent' ? 'rgba(34,197,94,0.1)' : stats?.dailyPerformance === 'Good' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)';

  return (
    <div>
      {/* Earnings Banner */}
      <div className="cdl-earnings-banner">
        <div>
          <div className="cdl-earnings-lbl">Your Earnings (after 8% commission)</div>
          <div className="cdl-earnings-big">₹{stats?.totalEarnings || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '0.4rem' }}>From {stats?.completedRides || 0} completed rides</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="cdl-earnings-lbl">Performance</div>
          <div className="cdl-perf-badge" style={{ background: perfBg, color: perfColor, border: `1px solid ${perfColor}33` }}>
            {stats?.dailyPerformance || 'N/A'}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#555' }}>
            Total Fare: ₹{stats?.totalFare || 0} &nbsp;|&nbsp; Commission (8%): ₹{stats?.totalCommission || 0}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="cdl-stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="cdl-stat-card">
          <div className="cdl-stat-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}><FaRoute /></div>
          <div>
            <div className="cdl-stat-label">Completed Rides</div>
            <div className="cdl-stat-value" style={{ color: '#22C55E' }}>{stats?.completedRides || 0}</div>
            <div className="cdl-stat-sub">Earning rides</div>
          </div>
        </div>
        <div className="cdl-stat-card">
          <div className="cdl-stat-icon" style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}><FaMoneyBillWave /></div>
          <div>
            <div className="cdl-stat-label">Avg per Ride</div>
            <div className="cdl-stat-value" style={{ color: '#FFD700' }}>
              ₹{stats?.completedRides ? Math.round(stats.totalEarnings / stats.completedRides) : 0}
            </div>
            <div className="cdl-stat-sub">Average fare</div>
          </div>
        </div>
        <div className="cdl-stat-card">
          <div className="cdl-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}><FaChartLine /></div>
          <div>
            <div className="cdl-stat-label">Cancelled</div>
            <div className="cdl-stat-value" style={{ color: '#EF4444' }}>{stats?.cancelledRides || 0}</div>
            <div className="cdl-stat-sub">Lost earnings</div>
          </div>
        </div>
      </div>

      {/* Vehicle Breakdown */}
      {Object.keys(vehicleBreakdown).length > 0 && (
        <div className="cdl-table-box" style={{ marginBottom: '1.5rem' }}>
          <div className="cdl-table-head">
            <span className="cdl-table-title">Earnings by Vehicle Type</span>
          </div>
          <div className="cdl-table-wrap">
            <table className="cdl-table">
              <thead>
                <tr><th>Vehicle</th><th>Rides</th><th>Total Earned</th><th>Avg per Ride</th></tr>
              </thead>
              <tbody>
                {Object.entries(vehicleBreakdown).map(([v, d]) => (
                  <tr key={v}>
                    <td style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                      {v === 'bike' ? '🏍️' : v === 'auto' ? '🛺' : '🚗'} {v}
                    </td>
                    <td>{d.count}</td>
                    <td style={{ color: '#FFD700', fontWeight: '700' }}>₹{d.total}</td>
                    <td style={{ color: '#888' }}>₹{Math.round(d.total / d.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ride-wise Earnings */}
      <div className="cdl-table-box">
        <div className="cdl-table-head">
          <span className="cdl-table-title">Ride-wise Earnings</span>
          <span style={{ fontSize: '0.78rem', color: '#555' }}>{rides.length} completed rides</span>
        </div>
        {rides.length === 0 ? (
          <div className="cdl-empty"><div className="ei">💰</div><div className="et">No earnings yet</div><div className="es">Complete rides to see your earnings here</div></div>
        ) : (
          <div className="cdl-table-wrap">
            <table className="cdl-table">
              <thead>
                <tr><th>#</th><th>Passenger</th><th>Route</th><th>Vehicle</th><th>Fare</th><th>Payment</th><th>Date</th></tr>
              </thead>
              <tbody>
                {rides.map((ride, i) => (
                  <tr key={ride._id}>
                    <td style={{ color: '#555' }}>{i + 1}</td>
                    <td>{ride.user?.name || 'N/A'}</td>
                    <td style={{ maxWidth: 180 }}>
                      <div style={{ fontSize: '0.78rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ride.pickup} → {ride.dropoff}
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{ride.vehicleType}</td>
                    <td style={{ color: '#22C55E', fontWeight: '700' }}>₹{ride.fare}</td>
                    <td style={{ textTransform: 'capitalize', color: '#888' }}>{ride.paymentMethod || 'cash'}</td>
                    <td style={{ color: '#555', whiteSpace: 'nowrap' }}>{new Date(ride.createdAt).toLocaleDateString('en-IN')}</td>
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

export default CaptainEarnings;

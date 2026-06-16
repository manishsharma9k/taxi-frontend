import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../api.js';

const FILTERS = ['all', 'completed', 'cancelled'];

const CaptainRideHistory = () => {
  const [rides, setRides] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/captains/ride-history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setRides(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = filter === 'all' ? rides : rides.filter(r => r.status === filter);

  if (loading) return <div className="cdl-loading">Loading ride history...</div>;

  return (
    <div>
      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.5rem 1.1rem', borderRadius: '100px', border: 'none', cursor: 'pointer',
            fontWeight: '700', fontSize: '0.78rem', textTransform: 'capitalize', transition: 'all 0.2s',
            background: filter === f ? '#FFD700' : '#1A1A1A',
            color: filter === f ? '#000' : '#555',
          }}>{f === 'all' ? `All (${rides.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${rides.filter(r => r.status === f).length})`}</button>
        ))}
      </div>

      <div className="cdl-table-box">
        <div className="cdl-table-head">
          <span className="cdl-table-title">Ride History</span>
          <span style={{ fontSize: '0.78rem', color: '#555' }}>{filtered.length} rides</span>
        </div>
        {filtered.length === 0 ? (
          <div className="cdl-empty"><div className="ei">📋</div><div className="et">No rides found</div><div className="es">No {filter !== 'all' ? filter : ''} rides in your history</div></div>
        ) : (
          <div className="cdl-table-wrap">
            <table className="cdl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Passenger</th>
                  <th>Pickup</th>
                  <th>Drop</th>
                  <th>Vehicle</th>
                  <th>Fare</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ride, i) => (
                  <tr key={ride._id}>
                    <td style={{ color: '#555' }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#ddd' }}>{ride.user?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#555' }}>{ride.user?.phone || ''}</div>
                    </td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ride.pickup}</td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ride.dropoff}</td>
                    <td style={{ textTransform: 'capitalize' }}>{ride.vehicleType}</td>
                    <td style={{ color: '#FFD700', fontWeight: '700' }}>₹{ride.fare}</td>
                    <td style={{ textTransform: 'capitalize', color: '#888' }}>{ride.paymentMethod || 'cash'}</td>
                    <td><span className={`cdl-badge ${ride.status}`}>{ride.status}</span></td>
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

export default CaptainRideHistory;

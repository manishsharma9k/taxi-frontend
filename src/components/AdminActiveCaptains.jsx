import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Search, RefreshCw, Activity } from 'lucide-react';
import Swal from 'sweetalert2';

const VEHICLE_ICONS = { bike: '🏍️', auto: '🛺', cab: '🚗' };

const AdminActiveCaptains = ({ defaultVehicle = 'all' }) => {
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState(defaultVehicle);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchActiveCaptains = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/online-captains', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setCaptains(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveCaptains();
    const id = setInterval(fetchActiveCaptains, 10000); // auto-refresh every 10s
    return () => clearInterval(id);
  }, [fetchActiveCaptains]);

  const handleViewStats = async (captain) => {
    try {
      Swal.fire({ title: 'Loading...', didOpen: () => Swal.showLoading() });
      const res = await axios.get(`http://localhost:5000/api/admin/captains/${captain._id}/stats`);
      const s = res.data;
      Swal.fire({
        title: `📊 ${captain.name}`,
        html: `
          <div style="text-align:left;font-family:Inter,sans-serif">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
              <div style="background:#f0fdf4;border-radius:10px;padding:12px;border:1px solid #bbf7d0">
                <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Completed</div>
                <div style="font-size:1.6rem;font-weight:900;color:#16a34a">${s.completedRides || 0}</div>
              </div>
              <div style="background:#fef2f2;border-radius:10px;padding:12px;border:1px solid #fecaca">
                <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Cancelled</div>
                <div style="font-size:1.6rem;font-weight:900;color:#dc2626">${s.cancelledRides || 0}</div>
              </div>
              <div style="background:#fffbeb;border-radius:10px;padding:12px;border:1px solid #fde68a">
                <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Earnings</div>
                <div style="font-size:1.6rem;font-weight:900;color:#d97706">₹${s.totalEarnings || 0}</div>
              </div>
              <div style="background:#eff6ff;border-radius:10px;padding:12px;border:1px solid #bfdbfe">
                <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Performance</div>
                <div style="font-size:1.1rem;font-weight:800;color:#2563eb;margin-top:4px">${s.dailyPerformance || 'N/A'}</div>
              </div>
            </div>
            <div style="margin-top:12px;padding:10px 14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;font-size:13px;color:#475569">
              <b>Commission (8%):</b> ₹${s.totalCommission || 0} &nbsp;|&nbsp; <b>Total Fare:</b> ₹${s.totalFare || 0}
            </div>
          </div>`,
        confirmButtonColor: '#3b82f6',
      });
    } catch { Swal.fire('Error', 'Could not load stats', 'error'); }
  };

  const filtered = captains.filter(c => {
    const matchSearch =
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm) ||
      (c.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchVehicle = vehicleFilter === 'all' || c.vehicleType === vehicleFilter;
    return matchSearch && matchVehicle;
  });

  if (loading) return <div className="loading">Loading active captains...</div>;

  return (
    <div className="admin-table-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>
            🟢 Active Captains
            <span style={{ marginLeft: '10px', background: '#dcfce7', color: '#16a34a', fontSize: '13px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', border: '1px solid #bbf7d0' }}>
              {captains.length} Online
            </span>
          </h2>
          {lastUpdated && (
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • Auto-refreshes every 10s
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Vehicle filter chips */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'bike', 'auto', 'cab'].map(v => (
              <button key={v} onClick={() => setVehicleFilter(v)} style={{
                padding: '6px 14px', borderRadius: '100px', border: 'none', cursor: 'pointer',
                fontWeight: '700', fontSize: '12px', textTransform: 'capitalize', transition: 'all 0.2s',
                background: vehicleFilter === v ? '#1e293b' : '#f1f5f9',
                color: vehicleFilter === v ? '#fff' : '#64748b',
              }}>
                {v === 'all' ? `All (${captains.length})` : `${VEHICLE_ICONS[v]} ${v} (${captains.filter(c => c.vehicleType === v).length})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search name, phone, vehicle..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 34px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '13px' }}
            />
          </div>

          {/* Refresh */}
          <button onClick={fetchActiveCaptains} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Total Online', value: captains.length, color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: '🏍️ Bikes', value: captains.filter(c => c.vehicleType === 'bike').length, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
          { label: '🛺 Autos', value: captains.filter(c => c.vehicleType === 'auto').length, color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0' },
          { label: '🚗 Cabs', value: captains.filter(c => c.vehicleType === 'cab').length, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '12px 16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: s.color, lineHeight: 1, marginTop: '4px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔴</div>
          <div style={{ fontWeight: '700', fontSize: '1rem', color: '#64748b' }}>No active captains right now</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Captains will appear here when they go online</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Captain</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Vehicle No.</th>
                <th>Rating</th>
                <th>Location</th>
                <th>Last Active</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((captain, i) => (
                <tr key={captain._id}>
                  <td style={{ color: '#94a3b8', fontSize: '13px' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {captain.photo ? (
                        <img src={captain.photo} alt={captain.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#4f46e5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                          {captain.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{captain.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{captain.customId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px' }}>{captain.phone}</td>
                  <td>
                    <span style={{ fontSize: '1.2rem' }}>{VEHICLE_ICONS[captain.vehicleType]}</span>
                    <span style={{ marginLeft: '6px', fontSize: '13px', textTransform: 'capitalize', fontWeight: '600' }}>{captain.vehicleType}</span>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{captain.vehicleNumber}</td>
                  <td>
                    <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '13px' }}>⭐ {captain.rating || '5.0'}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {captain.location?.lat && captain.location?.lng
                      ? `${captain.location.lat.toFixed(4)}, ${captain.location.lng.toFixed(4)}`
                      : <span style={{ color: '#cbd5e1' }}>No location</span>}
                  </td>
                  <td style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {captain.location?.updatedAt
                      ? new Date(captain.location.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', border: '1px solid #bbf7d0' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 5px #22c55e' }} />
                      Online
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleViewStats(captain)} title="View Stats" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                      <Activity size={18} color="#3b82f6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminActiveCaptains;

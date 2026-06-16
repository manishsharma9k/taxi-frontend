import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_URL } from '../api.js';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const makeIcon = (emoji, color) => L.divIcon({
  html: `<div style="background:${color};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)">${emoji}</div>`,
  className: '', iconSize: [34, 34], iconAnchor: [17, 17],
});

const BIKE_ICON = makeIcon('🏍️', '#f59e0b');
const AUTO_ICON = makeIcon('🛺', '#10b981');
const CAB_ICON  = makeIcon('🚗', '#3b82f6');
const USER_ICON = makeIcon('👤', '#8b5cf6');

const vehicleIcon = (type) => type === 'bike' ? BIKE_ICON : type === 'auto' ? AUTO_ICON : CAB_ICON;

// Reverse geocode to get area name
const getAreaName = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.county || data.address?.state_district || 'Unknown Area';
  } catch { return 'Unknown Area'; }
};

const AdminLiveMap = () => {
  const [captains, setCaptains] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
  const [areaStats, setAreaStats] = useState({});
  const [filter, setFilter] = useState('all'); // all | bike | auto | cab
  const [loading, setLoading] = useState(true);
  const areaCache = useRef({});

  const fetchData = async () => {
    try {
      const [capRes, rideRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/online-captains`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch(`${API_URL}/api/admin/rides?status=ongoing`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }),
      ]);
      const capData = await capRes.json();
      const rideData = await rideRes.json();
      setCaptains(Array.isArray(capData) ? capData : []);
      setActiveRides(Array.isArray(rideData) ? rideData : []);

      // Build area-wise stats
      const areas = {};
      for (const c of (Array.isArray(capData) ? capData : [])) {
        if (!c.location?.lat || !c.location?.lng) continue;
        const key = `${c.location.lat.toFixed(1)}_${c.location.lng.toFixed(1)}`;
        if (!areaCache.current[key]) {
          areaCache.current[key] = await getAreaName(c.location.lat, c.location.lng);
        }
        const area = areaCache.current[key];
        if (!areas[area]) areas[area] = { bike: 0, auto: 0, cab: 0, total: 0 };
        areas[area][c.vehicleType] = (areas[area][c.vehicleType] || 0) + 1;
        areas[area].total++;
      }
      setAreaStats(areas);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, []);

  const filtered = filter === 'all' ? captains : captains.filter(c => c.vehicleType === filter);
  const onlineCaptains = captains.length;
  const activeUsers = activeRides.length;
  const mapCenter = captains.find(c => c.location?.lat)
    ? [captains.find(c => c.location?.lat).location.lat, captains.find(c => c.location?.lat).location.lng]
    : [26.8467, 80.9462];

  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Online Captains', value: onlineCaptains, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', icon: '🟢' },
          { label: 'Active Rides', value: activeUsers, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: '🚗' },
          { label: 'Bikes Online', value: captains.filter(c => c.vehicleType === 'bike').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '🏍️' },
          { label: 'Autos Online', value: captains.filter(c => c.vehicleType === 'auto').length, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: '🛺' },
          { label: 'Cabs Online', value: captains.filter(c => c.vehicleType === 'cab').length, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: '🚕' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['all', 'bike', 'auto', 'cab'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.4rem 1rem', borderRadius: '100px', border: 'none', cursor: 'pointer',
            fontWeight: '700', fontSize: '0.78rem', textTransform: 'capitalize', transition: 'all 0.2s',
            background: filter === f ? '#1e293b' : '#f1f5f9',
            color: filter === f ? '#fff' : '#64748b',
          }}>
            {f === 'all' ? `All (${onlineCaptains})` : `${f === 'bike' ? '🏍️' : f === 'auto' ? '🛺' : '🚗'} ${f} (${captains.filter(c => c.vehicleType === f).length})`}
          </button>
        ))}
        <button onClick={fetchData} style={{ marginLeft: 'auto', padding: '0.4rem 1rem', borderRadius: '100px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Map */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '480px', marginBottom: '1.25rem' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b', fontSize: '0.9rem', gap: '0.5rem' }}>
            <div style={{ width: 18, height: 18, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Loading live map...
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Online Captains */}
            {filtered.map(c => c.location?.lat && c.location?.lng ? (
              <Marker key={c._id} position={[c.location.lat, c.location.lng]} icon={vehicleIcon(c.vehicleType)}>
                <Popup>
                  <div style={{ minWidth: 160, fontFamily: 'Inter,sans-serif' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>{c.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '2px' }}>
                      {c.vehicleType === 'bike' ? '🏍️' : c.vehicleType === 'auto' ? '🛺' : '🚗'} {c.vehicleType} • {c.vehicleNumber}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#f59e0b' }}>⭐ {c.rating || '5.0'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: '4px', fontWeight: '600' }}>● Online</div>
                    {c.location?.updatedAt && (
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                        Updated: {new Date(c.location.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ) : null)}

            {/* Active Ride Users */}
            {activeRides.map((ride, i) => (
              <Marker key={`user-${i}`} position={[26.8467 + (Math.random() - 0.5) * 0.1, 80.9462 + (Math.random() - 0.5) * 0.1]} icon={USER_ICON}>
                <Popup>
                  <div style={{ minWidth: 150, fontFamily: 'Inter,sans-serif' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>Active Ride</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>👤 {ride.user?.name || 'User'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>📍 {ride.pickup?.substring(0, 30)}...</div>
                    <div style={{ fontSize: '0.72rem', color: '#3b82f6', marginTop: '4px', fontWeight: '600' }}>● Ride in Progress</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Area-wise Stats Table */}
      {Object.keys(areaStats).length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>📍 Area-wise Captain Distribution</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{Object.keys(areaStats).length} areas</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Area', 'Total', '🏍️ Bike', '🛺 Auto', '🚗 Cab'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(areaStats).sort((a, b) => b[1].total - a[1].total).map(([area, data], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b' }}>{area}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '2px 10px', borderRadius: '100px', fontWeight: '700', fontSize: '0.8rem' }}>{data.total}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#f59e0b', fontWeight: '700' }}>{data.bike || 0}</td>
                    <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: '700' }}>{data.auto || 0}</td>
                    <td style={{ padding: '12px 16px', color: '#3b82f6', fontWeight: '700' }}>{data.cab || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No captains online */}
      {!loading && captains.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗺️</div>
          <div style={{ fontWeight: '600', color: '#64748b' }}>No captains online right now</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Captains will appear here when they go online</div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveMap;

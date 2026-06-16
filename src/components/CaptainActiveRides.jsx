import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaPhone, FaMapMarkerAlt, FaArrowRight, FaBolt, FaExclamationTriangle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_URL } from '../api.js';

const VEHICLE_ICONS = { bike: '🏍️', auto: '🛺', cab: '🚗' };

const CaptainActiveRides = ({ isOnline }) => {
  const [pendingRides, setPendingRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [view, setView] = useState('requests'); // 'requests' | 'active'
  const [cancelling, setCancelling] = useState(false);
  const { token } = useContext(AuthContext);

  const fetchPending = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/api/rides/pending`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setPendingRides(d)).catch(() => {});
  }, [token]);

  const fetchActive = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/api/rides/active`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.activeRide) { setActiveRide(d.activeRide); setView('active'); } }).catch(() => {});
  }, [token]);

  useEffect(() => {
    fetchPending();
    fetchActive();
    const id = setInterval(fetchPending, 4000);
    return () => clearInterval(id);
  }, [fetchPending, fetchActive]);

  const acceptRide = async (rideId) => {
    try {
      const res = await fetch(`${API_URL}/api/rides/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rideId }),
      });
      const data = await res.json();
      if (res.ok) { setActiveRide(data.ride); setView('active'); }
      else Swal.fire('Error', data.message, 'error');
    } catch { Swal.fire('Error', 'Network error', 'error'); }
  };

  const updateStatus = async (status, otp = null) => {
    try {
      const payload = { rideId: activeRide._id, status };
      if (otp) payload.otp = otp;
      const res = await fetch(`${API_URL}/api/rides/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) setActiveRide(data.ride);
      else Swal.fire('Error', data.message || 'Failed', 'error');
    } catch { Swal.fire('Error', 'Network error', 'error'); }
  };

  const handleStartRide = async () => {
    const { value: otp } = await Swal.fire({
      title: '🔐 Verify OTP',
      html: '<p style="color:#888;font-size:0.85rem">Ask the passenger for their 4-digit OTP</p>',
      input: 'text',
      inputPlaceholder: 'Enter 4-digit OTP',
      showCancelButton: true,
      confirmButtonColor: '#FFD700',
      confirmButtonText: 'Verify & Start',
      background: '#141414', color: '#fff',
      inputAttributes: { maxlength: 4, style: 'text-align:center;font-size:1.5rem;letter-spacing:0.3em;background:#1A1A1A;color:#fff;border:1px solid #333;border-radius:8px;padding:0.75rem' },
      inputValidator: v => !v && 'Please enter the OTP',
    });
    if (otp) updateStatus('ongoing', otp);
  };

  const handleCancel = async () => {
    const reasons = [
      'Passenger not at pickup',
      'Passenger misbehaviour',
      'Vehicle breakdown',
      'Emergency',
      'Other reason',
    ];

    const { value: reason } = await Swal.fire({
      title: '⚠️ Cancel Ride?',
      html: `
        <p style="color:#888;font-size:0.85rem;margin-bottom:1rem">Select a reason for cancellation</p>
        <div style="display:flex;flex-direction:column;gap:0.5rem;text-align:left">
          ${reasons.map((r, i) => `
            <label style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;cursor:pointer;font-size:0.875rem;color:#ccc">
              <input type="radio" name="cancel_reason" value="${r}" style="accent-color:#FFD700;width:16px;height:16px;flex-shrink:0" ${i === 0 ? 'checked' : ''} />
              ${r}
            </label>
          `).join('')}
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Cancel Ride',
      cancelButtonText: 'Go Back',
      background: '#141414',
      color: '#fff',
      preConfirm: () => {
        const selected = document.querySelector('input[name="cancel_reason"]:checked');
        if (!selected) { Swal.showValidationMessage('Please select a reason'); return false; }
        return selected.value;
      },
    });

    if (!reason) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API_URL}/api/rides/captain-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rideId: activeRide._id, cancelReason: reason }),
      });
      const data = await res.json();
      if (res.ok) {
        await Swal.fire({
          title: 'Ride Cancelled',
          text: 'The ride has been cancelled and the passenger has been notified.',
          icon: 'info',
          confirmButtonColor: '#FFD700',
          background: '#141414',
          color: '#fff',
        });
        setActiveRide(null);
        setView('requests');
      } else {
        Swal.fire('Error', data.message || 'Failed to cancel', 'error');
      }
    } catch {
      Swal.fire('Error', 'Network error', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handlePaymentDone = () => { setActiveRide(null); setView('requests'); };

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'requests', label: `Ride Requests${pendingRides.length > 0 ? ` (${pendingRides.length})` : ''}` },
          { id: 'active',   label: `Active Ride${activeRide ? ' ●' : ''}` },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{
            padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.2s',
            background: view === t.id ? '#FFD700' : '#1A1A1A',
            color: view === t.id ? '#000' : '#555',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Ride Requests ── */}
      {view === 'requests' && (
        <>
          {!isOnline ? (
            <div className="cdl-empty"><div className="ei">📴</div><div className="et">You are Offline</div><div className="es">Go online from the sidebar to receive ride requests</div></div>
          ) : pendingRides.length === 0 ? (
            <div className="cdl-empty"><div className="ei">🛣️</div><div className="et">No Ride Requests</div><div className="es">Waiting for new requests in your area...</div></div>
          ) : (
            <div className="cdl-rides-grid">
              {pendingRides.map(ride => (
                <div key={ride._id} className="cdl-ride-card">
                  <div className="cdl-ride-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>{VEHICLE_ICONS[ride.vehicleType] || '🚗'}</span>
                      <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', textTransform: 'capitalize' }}>{ride.vehicleType}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="cdl-fare">₹{ride.fare}</div>
                      <div className="cdl-fare-lbl">Estimated fare</div>
                    </div>
                  </div>
                  <div className="cdl-ride-card-body">
                    <div className="cdl-route">
                      <div className="cdl-route-row">
                        <div className="cdl-route-icon-col">
                          <div className="cdl-dot-green" />
                          <div className="cdl-route-line" />
                        </div>
                        <div><div className="cdl-route-lbl">Pickup</div><div className="cdl-route-val">{ride.pickup}</div></div>
                      </div>
                      <div className="cdl-route-row">
                        <div className="cdl-route-icon-col"><div className="cdl-dot-red" /></div>
                        <div><div className="cdl-route-lbl">Drop</div><div className="cdl-route-val">{ride.dropoff}</div></div>
                      </div>
                    </div>
                    {ride.user && (
                      <div className="cdl-pax-row">
                        <div className="cdl-pax-av">👤</div>
                        <div>
                          <div className="cdl-pax-name">{ride.user.name || 'Passenger'}</div>
                          <div className="cdl-pax-phone">{ride.user.phone || ''}</div>
                        </div>
                      </div>
                    )}
                    <div className="cdl-card-actions">
                      <button className="cdl-btn-accept" onClick={() => acceptRide(ride._id)}>
                        <FaCheckCircle size={14} /> Accept Ride
                      </button>
                      <button className="cdl-btn-decline" title="Decline"><FaTimesCircle size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Active Ride ── */}
      {view === 'active' && (
        <>
          {!activeRide ? (
            <div className="cdl-empty"><div className="ei">✅</div><div className="et">No Active Ride</div><div className="es">Accept a ride request to see it here</div></div>
          ) : (
            <div className="cdl-active-panel">
              <div className="cdl-active-panel-top">
                <div className="cdl-status-pill">
                  <span className="cdl-status-dot" />
                  {activeRide.status === 'accepted' ? 'Heading to Pickup' : activeRide.status === 'ongoing' ? 'Ride in Progress' : activeRide.status === 'completed' ? 'Ride Completed' : activeRide.status}
                </div>
                <span style={{ fontSize: '1.5rem' }}>{VEHICLE_ICONS[activeRide.vehicleType] || '🚗'}</span>
              </div>

              <div className="cdl-active-body">
                {/* Route */}
                <div className="cdl-route-card">
                  <div className="cdl-route-card-row">
                    <div className="cdl-rc-icon pickup"><FaMapMarkerAlt size={13} /></div>
                    <div><div className="cdl-rc-lbl">Pickup</div><div className="cdl-rc-val">{activeRide.pickup}</div></div>
                  </div>
                  <div className="cdl-rc-divider" />
                  <div className="cdl-route-card-row">
                    <div className="cdl-rc-icon dropoff"><FaArrowRight size={13} /></div>
                    <div><div className="cdl-rc-lbl">Drop</div><div className="cdl-rc-val">{activeRide.dropoff}</div></div>
                  </div>
                </div>

                {/* Passenger */}
                {activeRide.user && (
                  <div className="cdl-pax-card">
                    <div className="cdl-pax-info">
                      <div className="cdl-pax-big-av">👤</div>
                      <div>
                        <div className="cdl-pax-big-name">{activeRide.user.name}</div>
                        <div className="cdl-pax-big-phone">{activeRide.user.phone}</div>
                      </div>
                    </div>
                    <a href={`tel:${activeRide.user.phone}`} className="cdl-call-btn"><FaPhone size={14} /></a>
                  </div>
                )}

                {/* Fare */}
                <div className="cdl-fare-row">
                  <div><div className="cdl-fare-lbl2">Fare</div><div className="cdl-fare-big">₹{activeRide.fare}</div></div>
                  <div style={{ textAlign: 'right' }}><div className="cdl-fare-lbl2">Payment</div><div className="cdl-fare-method">{activeRide.paymentMethod || 'Cash'}</div></div>
                </div>

                {/* OTP — captain must ask passenger, never shown here */}
                {activeRide.status === 'accepted' && (
                  <div className="cdl-otp-box" style={{ background: 'rgba(239,68,68,0.08)', border: '1px dashed #ef4444' }}>
                    <div className="cdl-otp-lbl" style={{ color: '#ef4444' }}>🔐 Ask passenger for OTP to start ride</div>
                  </div>
                )}

                {/* Actions */}
                <div className="cdl-actions">
                  {activeRide.status === 'accepted' && (
                    <button className="cdl-btn-start" onClick={handleStartRide}><FaBolt size={16} /> Start Ride</button>
                  )}
                  {activeRide.status === 'ongoing' && (
                    <button className="cdl-btn-complete" onClick={() => updateStatus('completed')}><FaCheckCircle size={16} /> Complete Ride</button>
                  )}
                  {activeRide.status === 'completed' && (
                    <button className="cdl-btn-done" onClick={handlePaymentDone}><FaCheckCircle size={16} /> Payment Collected — Done</button>
                  )}
                  {['accepted', 'ongoing'].includes(activeRide.status) && (
                    <button className="cdl-btn-cancel" onClick={handleCancel} disabled={cancelling}>
                      <FaExclamationTriangle size={14} /> {cancelling ? 'Cancelling...' : 'Cancel This Ride'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CaptainActiveRides;

import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Phone, ShieldCheck, Star, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import PaymentGateway from './PaymentGateway';
import './CSS/LiveTrackingMap.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { AuthContext } from '../context/AuthContext';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const captainIcon = new L.DivIcon({
   html: `<div style="background:#FFD700;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏍️</div>`,
   className: '', iconSize: [32, 32], iconAnchor: [16, 16]
});

const LiveTrackingMap = ({ rideDetails, onCancel }) => {
   const baseLat = 26.8467;
   const baseLng = 80.9462;
   const { token } = useContext(AuthContext) || { token: localStorage.getItem('qr_token') };
   const [driverPos, setDriverPos] = useState([baseLat + 0.05, baseLng + 0.05]);
   const [eta, setEta] = useState(7);
   const [showPayment, setShowPayment] = useState(false);
   const [isCompleted, setIsCompleted] = useState(false);
   const [isCancelling, setIsCancelling] = useState(false);
   const [status, setStatus] = useState(rideDetails?.status || 'pending');
   const [captain, setCaptain] = useState(rideDetails?.captain || null);
   const [rideOtp, setRideOtp] = useState(rideDetails?.otp || null);
   const [nearbyCaptains, setNearbyCaptains] = useState([]);

   // Fetch nearby captains
   useEffect(() => {
      const fetchNearby = () => {
         fetch(`http://localhost:5000/api/captains/nearby?lat=${baseLat}&lng=${baseLng}&radius=15&vehicleType=${rideDetails?.id || ''}`)
            .then(r => r.json())
            .then(d => Array.isArray(d) && setNearbyCaptains(d))
            .catch(() => { });
      };
      fetchNearby();
      const id = setInterval(fetchNearby, 10000);
      return () => clearInterval(id);
   }, [rideDetails?.id]);

   useEffect(() => {
      // Poll the database for ride updates every 3 seconds
      const intervalId = setInterval(async () => {
         if (!rideDetails?.rideId) return;

         try {
            const res = await fetch(`http://localhost:5000/api/rides/${rideDetails.rideId}`, {
               headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
               const updatedRide = await res.json();
               setStatus(updatedRide.status);
               if (updatedRide.otp) setRideOtp(updatedRide.otp);

               if (updatedRide.captain) {
                  setCaptain({
                     name: updatedRide.captain.name,
                     phone: updatedRide.captain.phone,
                     car: updatedRide.captain.vehicleType,
                     plate: updatedRide.captain.vehicleNumber,
                     rating: updatedRide.captain.rating,
                     photo: updatedRide.captain.photo
                  });
               }

               if (updatedRide.status === 'completed') {
                  if (!isCompleted) {
                     setIsCompleted(true);
                     setShowPayment(true);
                  }
               }
            } else {
               console.error('Fetch failed with status', res.status);
               const txt = await res.text();
               console.error(txt);
            }
         } catch (err) {
            console.error('Error fetching ride status', err);
         }
      }, 3000);

      return () => clearInterval(intervalId);
   }, [rideDetails, token]);

   useEffect(() => {
      if (status !== 'accepted' && status !== 'ongoing') return;
      // Simulate interactive car path movement closing in precisely to baseLat/baseLng
      const interval = setInterval(() => {
         setDriverPos(prev => {
            const moveLat = prev[0] > baseLat ? prev[0] - 0.005 : prev[0];
            const moveLng = prev[1] > baseLng ? prev[1] - 0.005 : prev[1];
            return [moveLat, moveLng];
         });

         setEta(prev => {
            if (prev > 1) return prev - 1;
            return prev; // "Arriving"
         });
      }, 4500);

      return () => clearInterval(interval);
   }, [baseLat, baseLng, status]);

   const handleCancelRide = async () => {
      if (!rideDetails?.rideId) return onCancel();

      const { value: cancelReason } = await Swal.fire({
         title: 'Cancel Ride',
         input: 'text',
         inputLabel: 'Reason for cancellation',
         inputPlaceholder: 'E.g., Driver is too far, changed my mind...',
         showCancelButton: true,
         confirmButtonColor: '#ef4444',
         confirmButtonText: 'Yes, cancel it',
         inputValidator: (value) => {
            if (!value) {
               return 'You need to write a reason!'
            }
         }
      });

      if (!cancelReason) return;

      setIsCancelling(true);
      try {
         const res = await fetch('http://localhost:5000/api/rides/cancel', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ rideId: rideDetails.rideId, cancelReason })
         });

         if (res.ok) {
            Swal.fire('Cancelled!', 'Your ride has been cancelled.', 'success');
            onCancel();
         } else {
            const data = await res.json();
            Swal.fire('Error', data.message || "Failed to cancel ride.", 'error');
         }
      } catch (err) {
         Swal.fire('Error', "Network error. Could not cancel ride.", 'error');
      } finally {
         setIsCancelling(false);
      }
   };

   return (
      <div className="animate-fade-in-up live-map-container">

         {/* Interactive Live Map Section */}
         <div className="map-wrapper">
            <MapContainer center={[baseLat, baseLng]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
               <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
               />
               {/* User Location */}
               <Marker position={[baseLat, baseLng]}>
                  <Popup>Your Pickup Location</Popup>
               </Marker>
               {/* Simulated Driver Approaching Location */}
               <Marker position={driverPos}>
                  <Popup>Driver is arriving</Popup>
               </Marker>
               {/* Nearby Captains */}
               {nearbyCaptains.map(c => (
                  c.location?.lat && c.location?.lng ? (
                     <Marker key={c._id} position={[c.location.lat, c.location.lng]} icon={captainIcon}>
                        <Popup>
                           <div style={{ minWidth: 140 }}>
                              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{c.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#666', marginTop: 2 }}>{c.vehicleType} • {c.vehicleNumber}</div>
                              <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: 2 }}>⭐ {c.rating}</div>
                              <div style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: 2 }}>● Online</div>
                           </div>
                        </Popup>
                     </Marker>
                  ) : null
               ))}
               {/* 10km radius circle */}
               <Circle center={[baseLat, baseLng]} radius={10000} pathOptions={{ color: '#FFD700', fillColor: '#FFD700', fillOpacity: 0.04, weight: 1, dashArray: '6' }} />
            </MapContainer>

            <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000 }}>
               <button onClick={handleCancelRide} title="Cancel Ride" className="cancel-ride-btn">
                  {isCancelling ? <Loader2 size={20} style={{ animation: 'spin 2s linear infinite' }} /> : <X size={20} />}
               </button>
            </div>

            {/* Top HUD Display */}
            <div className="hud-display">
               Tracking {rideDetails?.type || 'Vehicle'}
            </div>
         </div>

         {/* Driver Information Terminal */}
         <div className="terminal-section">
            <h4 className="terminal-title" style={{ color: eta > 1 ? 'var(--text-main)' : 'var(--primary)' }}>
               {status === 'pending' ? (
                  <>Ride Booked! Waiting for Captain... <Loader2 size={16} style={{ animation: 'spin 2s linear infinite' }} /></>
               ) : eta > 1 ? (
                  <>Driver arriving in ~{eta} min {eta % 2 === 0 ? <Loader2 size={16} style={{ animation: 'spin 2s linear infinite' }} /> : ''}</>
               ) : "Driver has arrived!"}
            </h4>

            <div className="driver-info-card" style={{ opacity: status === 'pending' ? 0.5 : 1 }}>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="driver-avatar">
                     {captain?.photo ? <img src={captain.photo} alt="Captain" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🧔🏽'}
                  </div>
                  <div>
                     <h4 className="driver-name">{captain?.name || 'Searching...'}</h4>
                     <div className="driver-rating">
                        <Star size={14} fill="var(--primary)" color="var(--primary)" /> {captain?.rating || "4.9"} • {captain?.car || captain?.vehicleType || rideDetails?.type}
                     </div>
                  </div>
               </div>

               <div style={{ textAlign: 'right' }}>
                  <div className="driver-plate">{captain?.plate || captain?.vehicleNumber || '----'}</div>
               </div>
            </div>

            {status === 'accepted' && rideOtp && (
               <div className="animate-fade-in-up" style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(250, 204, 21, 0.1)', border: '1px dashed var(--primary)', borderRadius: '0.75rem', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Share OTP to start ride</p>
                  <h1 style={{ margin: '0.5rem 0 0 0', color: 'var(--primary)', letterSpacing: '8px', fontSize: '2.5rem', fontWeight: '800' }}>{rideOtp}</h1>
               </div>
            )}

            <div className="terminal-actions">
               <button className="btn btn-outline action-btn" style={{ border: '1px solid var(--border-color)' }}>
                  <ShieldCheck size={18} /> Safety
               </button>
               <a href={`tel:${captain?.phone || ''}`} className="btn btn-primary action-btn" style={{ pointerEvents: !captain ? 'none' : 'auto', opacity: !captain ? 0.5 : 1 }}>
                  <Phone size={18} /> Call Captain
               </a>
            </div>

            {!isCompleted && (
               <button onClick={handleCancelRide} disabled={isCancelling} className="btn cancel-action-btn">
                  {isCancelling ? 'Cancelling...' : 'Cancel Ride'}
               </button>
            )}
            {eta <= 1 && !isCompleted && (
               <button onClick={() => { setIsCompleted(true); setShowPayment(true); }} className="btn btn-success complete-action-btn">
                  Complete Ride
               </button>
            )}
            {isCompleted && (
               <button onClick={() => setShowPayment(true)} className="btn btn-primary pay-action-btn">
                  Make Payment
               </button>
            )}

            {showPayment && (
               <PaymentGateway
                  amount={rideDetails?.price || rideDetails?.fare || 150}
                  currency="₹"
                  onClose={() => setShowPayment(false)}
                  onSuccess={(method) => {
                     setShowPayment(false);
                     alert(`Payment successful via ${method}. Ride completed!`);
                     onCancel();
                  }}
               />
            )}
         </div>

      </div>
   );
};

export default LiveTrackingMap;

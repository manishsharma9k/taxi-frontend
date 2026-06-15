import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MapPin, Navigation, Clock, Map, Loader2, LocateFixed, X, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LiveTrackingMap from './LiveTrackingMap';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import './CSS/RideForm.css';
import { DETAILED_LOCATIONS } from '../data/districts';
import { LUCKNOW_GROUPED } from '../data/lucknow';
import { UP_DISTRICTS_GROUPED } from '../data/up_districts';

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Component to handle map click and move marker
const DraggableMarker = ({ position, setPosition, icon }) => {
  useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]); },
  });
  return position ? <Marker position={position} icon={icon} draggable eventHandlers={{ dragend: (e) => setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]) }} /> : null;
};

// Auto-pan map to position
const MapPanner = ({ position }) => {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, map.getZoom()); }, [position, map]);
  return null;
};

// Map Picker Modal
const MapPickerModal = ({ title, icon: Icon, iconColor, markerIcon, initialPosition, onConfirm, onClose }) => {
  const [markerPos, setMarkerPos] = useState(initialPosition || [26.8467, 80.9462]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`);
      const data = await res.json();
      const a = data.address || {};
      const parts = [
        a.amenity || a.building || a.shop || a.cafe || a.restaurant || a.hotel,
        a.road || a.pedestrian || a.footway,
        a.neighbourhood || a.quarter,
        a.suburb || a.village || a.town,
        a.city || a.county,
      ].filter(Boolean);
      setAddress(parts.slice(0, 3).join(', ') || data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally { setLoading(false); }
  }, []);

  // On open: if no initialPosition provided, try to get GPS
  useEffect(() => {
    if (initialPosition) {
      reverseGeocode(initialPosition[0], initialPosition[1]);
      return;
    }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setMarkerPos([lat, lon]);
        reverseGeocode(lat, lon);
      },
      () => { reverseGeocode(26.8467, 80.9462); },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [reverseGeocode]);

  useEffect(() => { reverseGeocode(markerPos[0], markerPos[1]); }, [markerPos, reverseGeocode]);

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal" onClick={e => e.stopPropagation()}>
        <div className="map-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Icon size={18} color={iconColor} />
            <span className="map-modal-title">{title}</span>
          </div>
          <button className="map-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="map-modal-hint">📍 Tap on map or drag the pin to set location</div>

        <div className="map-modal-map">
          <MapContainer center={markerPos} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={true}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <DraggableMarker position={markerPos} setPosition={setMarkerPos} icon={markerIcon} />
            <MapPanner position={markerPos} />
          </MapContainer>
        </div>

        <div className="map-modal-footer">
          <div className="map-modal-address">
            {loading ? (
              <span style={{ color: '#888', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Fetching address...
              </span>
            ) : (
              <span>{address}</span>
            )}
          </div>
          <button
            className="map-modal-confirm"
            onClick={() => { if (address && !loading) onConfirm(address, markerPos); }}
            disabled={loading || !address}
          >
            <Check size={16} /> Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main RideForm ──
const RideForm = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);

  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isDropoffOpen, setIsDropoffOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Lucknow'); // For city tabs
  const [selectedArea, setSelectedArea] = useState('All'); // For area chips

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);

  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDropoffMap, setShowDropoffMap] = useState(false);

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const { user, token } = useContext(AuthContext);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const pickupTimeout = useRef(null);
  const dropoffTimeout = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target)) setIsPickupOpen(false);
      if (dropoffRef.current && !dropoffRef.current.contains(e.target)) setIsDropoffOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Store raw nominatim results so we can extract coords on selection
  const pickupResultsRef = useRef([]);
  const dropoffResultsRef = useRef([]);

  // Merge Lucknow areas + all UP districts into one grouped map
  const ALL_GROUPED = { ...LUCKNOW_GROUPED, ...UP_DISTRICTS_GROUPED };

  // City tabs config
  const CITY_TABS = [
    { id: 'Lucknow', label: '🏙️ Lucknow', data: LUCKNOW_GROUPED },
    { id: 'Kanpur Nagar', label: '🏭 Kanpur', data: { 'Kanpur': UP_DISTRICTS_GROUPED['Kanpur Nagar'] || [] } },
    { id: 'Agra', label: '🕌 Agra', data: { 'Agra': UP_DISTRICTS_GROUPED['Agra'] || [] } },
    { id: 'Varanasi', label: '🛕 Varanasi', data: { 'Varanasi': UP_DISTRICTS_GROUPED['Varanasi'] || [] } },
    { id: 'Prayagraj', label: '🌊 Prayagraj', data: { 'Prayagraj': UP_DISTRICTS_GROUPED['Prayagraj'] || [] } },
    { id: 'Gorakhpur', label: '🚂 Gorakhpur', data: { 'Gorakhpur': UP_DISTRICTS_GROUPED['Gorakhpur'] || [] } },
    { id: 'Ayodhya', label: '🪔 Ayodhya', data: { 'Ayodhya': UP_DISTRICTS_GROUPED['Ayodhya'] || [] } },
    { id: 'Meerut', label: '🏙️ Meerut', data: { 'Meerut': UP_DISTRICTS_GROUPED['Meerut'] || [] } },
    { id: 'Noida', label: '🏢 Noida', data: { 'Noida': UP_DISTRICTS_GROUPED['Gautam Buddha Nagar (Noida)'] || [] } },
    { id: 'Ghaziabad', label: '🏙️ Ghaziabad', data: { 'Ghaziabad': UP_DISTRICTS_GROUPED['Ghaziabad'] || [] } },
  ];

  const activeCityData = CITY_TABS.find(c => c.id === selectedCity)?.data || LUCKNOW_GROUPED;
  const areaKeys = ['All', ...Object.keys(activeCityData)];

  // Get places for current city + area filter
  const getAreaPlaces = () => {
    if (selectedArea === 'All') return activeCityData;
    return { [selectedArea]: activeCityData[selectedArea] || [] };
  };

  // Filter grouped areas by query (for live search override)
  const getGroupedDropoff = (query) => {
    const q = (query || '').toLowerCase().trim();
    if (!q) return null; // null = show city/area UI
    const filtered = {};
    Object.entries(ALL_GROUPED).forEach(([area, places]) => {
      const matched = places.filter(p => p.toLowerCase().includes(q));
      const areaMatch = area.toLowerCase().includes(q);
      if (matched.length > 0) filtered[area] = matched;
      else if (areaMatch) filtered[area] = places.slice(0, 5);
    });
    return filtered;
  };

  // UP bounding box: viewbox=lon_min,lat_min,lon_max,lat_max
  const UP_VIEWBOX = '77.0,23.8,84.7,30.5';

  const fetchLocations = async (query, setSuggestions, setSearching, resultsRef) => {
    if (!query || query.length < 2) { setSuggestions([]); return; }
    setSearching(true);
    try {
      // First try UP-bounded search for relevant local results
      const upRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&viewbox=${UP_VIEWBOX}&bounded=0&limit=8&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await upRes.json();
      resultsRef.current = data;
      setSuggestions(data.map(item => item.display_name));
    } catch { } finally { setSearching(false); }
  };

  const handlePickupChange = (e) => {
    const val = e.target.value;
    setPickup(val);
    setIsPickupOpen(true);
    clearTimeout(pickupTimeout.current);
    pickupTimeout.current = setTimeout(() => fetchLocations(val, setPickupSuggestions, setIsSearchingPickup, pickupResultsRef), 300);
  };

  const handleDropoffChange = (e) => {
    const val = e.target.value;
    setDropoff(val);
    setIsDropoffOpen(true);
    clearTimeout(dropoffTimeout.current);
    dropoffTimeout.current = setTimeout(() => fetchLocations(val, setDropoffSuggestions, setIsSearchingDropoff, dropoffResultsRef), 300);
  };

  const buildShortAddress = (a) => {
    // Extract the most precise parts: building/shop > road > neighbourhood > suburb > city
    const parts = [
      a.amenity || a.building || a.shop || a.cafe || a.restaurant || a.hotel,
      a.road || a.pedestrian || a.footway,
      a.neighbourhood || a.quarter,
      a.suburb || a.village || a.town,
      a.city || a.county,
    ].filter(Boolean);
    return parts.slice(0, 3).join(', ');
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    setIsSearchingPickup(true);
    setPickup('Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const address = buildShortAddress(data.address) || data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
          setPickup(address);
          setPickupCoords([lat, lon]);
          setIsPickupOpen(false);
        } catch {
          setPickup('');
        } finally {
          setIsSearchingPickup(false);
        }
      },
      (err) => {
        setIsSearchingPickup(false);
        setPickup('');
        if (err.code === 1) alert('Location permission denied. Please allow location access in your browser.');
        else if (err.code === 2) alert('Location unavailable. Please pick manually.');
        else alert('Location request timed out. Please pick manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => { getUserLocation(); }, []);

  const handleEstimate = async (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) { setError('Please enter both pickup and dropoff locations.'); return; }
    setError(''); setSelectedOption(null); setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/rides/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, dropoff }),
      });
      setEstimate(await res.json());
    } catch { } finally { setLoading(false); }
  };

  const handleConfirmRide = async () => {
    if (!selectedOption) { setError('Please select a ride option first.'); return; }
    if (!user || !token) { setError('Please login first to book a ride.'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/rides/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pickup, dropoff, fare: selectedOption.price, vehicleType: selectedOption.id, paymentMethod: 'cash', ...(pickupCoords && { pickupLat: pickupCoords[0], pickupLng: pickupCoords[1] }) }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({ title: 'Ride Confirmed!', text: 'Have a good day! 🚗✨', icon: 'success', confirmButtonColor: 'var(--primary)', timer: 3000, timerProgressBar: true });
        setActiveRide({ ...selectedOption, pickupLocation: pickup, dropoffLocation: dropoff, rideId: data.ride._id, status: data.ride.status, captain: data.ride.captain });
      } else { setError(data.message || 'Failed to book ride'); }
    } catch { setError('Network error.'); } finally { setLoading(false); }
  };

  const handleCancelRide = () => { setActiveRide(null); setEstimate(null); setPickup(''); setDropoff(''); setSelectedOption(null); };

  if (activeRide) return <LiveTrackingMap rideDetails={activeRide} onCancel={handleCancelRide} />;

  return (
    <>
      <div className="ride-form-container">
        <h3 className="ride-form-title">Where to?</h3>
        <p className="ride-form-subtitle">Enter your pickup and drop location</p>

        {error && <div className="ride-form-error">{error}</div>}

        <form onSubmit={handleEstimate} className="ride-form">

          {/* ── PICKUP ── */}
          <div ref={pickupRef} className="input-container">
            <MapPin size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Search pickup location..."
              className="input-field ride-input"
              value={pickup}
              onChange={handlePickupChange}
              onFocus={() => setIsPickupOpen(true)}
            />
            <div className="input-right-btns">
              <button type="button" className="map-pin-btn" title="Pick on Map" onClick={() => { setIsPickupOpen(false); setShowPickupMap(true); }}>
                <Map size={16} />
              </button>
              <button type="button" className="locate-me-btn" title="Use My Location" onClick={getUserLocation}>
                <LocateFixed size={16} />
              </button>
            </div>

            {isPickupOpen && (
              <div className="suggestions-dropdown animate-fade-in-up" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                <div className="use-current-location" onClick={getUserLocation}>
                  <Navigation size={14} /> Use Current Location
                </div>
                <div className="use-current-location" style={{ color: '#3B82F6', borderColor: 'rgba(59,130,246,0.15)' }} onClick={() => { setIsPickupOpen(false); setShowPickupMap(true); }}>
                  <Map size={14} /> Pick on Map
                </div>
                {isSearchingPickup && (
                  <div className="loading-text"><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</div>
                )}
                {/* Nominatim live results */}
                {!isSearchingPickup && pickupSuggestions.length > 0 && pickupSuggestions.map((loc, i) => (
                  <div key={i} className="suggestion-item" onClick={() => {
                    setPickup(loc);
                    setIsPickupOpen(false);
                    const match = pickupResultsRef.current.find(r => r.display_name === loc);
                    if (match) setPickupCoords([parseFloat(match.lat), parseFloat(match.lon)]);
                  }}>
                    <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{loc}</span>
                  </div>
                ))}
                {/* Grouped local fallback when no live results */}
                {!isSearchingPickup && pickupSuggestions.length === 0 && !pickup.trim() &&
                  Object.entries(getAreaPlaces()).map(([area, places]) => (
                    <div key={area}>
                      <div className="area-header">{area}</div>
                      {places.map((loc, i) => (
                        <div key={i} className="suggestion-item" onClick={() => { setPickup(loc); setIsPickupOpen(false); }}>
                          <MapPin size={13} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{loc}</span>
                        </div>
                      ))}
                    </div>
                  ))
                }
                {!isSearchingPickup && pickupSuggestions.length === 0 && pickup.trim() && getGroupedDropoff(pickup) &&
                  Object.entries(getGroupedDropoff(pickup)).map(([area, places]) => (
                    <div key={area}>
                      <div className="area-header">{area}</div>
                      {places.map((loc, i) => (
                        <div key={i} className="suggestion-item" onClick={() => { setPickup(loc); setIsPickupOpen(false); }}>
                          <MapPin size={13} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{loc}</span>
                        </div>
                      ))}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* ── DROPOFF ── */}
          <div ref={dropoffRef} className="input-container">
            <Navigation size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Search drop location..."
              className="input-field ride-input"
              value={dropoff}
              onChange={handleDropoffChange}
              onFocus={() => setIsDropoffOpen(true)}
            />
            <div className="input-right-btns">
              <button type="button" className="map-pin-btn" title="Pick on Map" onClick={() => { setIsDropoffOpen(false); setShowDropoffMap(true); }}>
                <Map size={16} />
              </button>
            </div>

            {isDropoffOpen && (
              <div className="suggestions-dropdown rapido-dropdown animate-fade-in-up" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                <div className="use-current-location" style={{ color: '#3B82F6', borderColor: 'rgba(59,130,246,0.15)' }} onClick={() => { setIsDropoffOpen(false); setShowDropoffMap(true); }}>
                  <Map size={14} /> Pick on Map
                </div>
                {isSearchingDropoff && (
                  <div className="loading-text"><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</div>
                )}
                {/* Nominatim live results — shown first when user types */}
                {!isSearchingDropoff && dropoffSuggestions.length > 0 && dropoffSuggestions.map((loc, i) => (
                  <div key={i} className="suggestion-item" onClick={() => { setDropoff(loc); setIsDropoffOpen(false); }}>
                    <Navigation size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{loc}</span>
                  </div>
                ))}
                {/* Rapido-style city/area UI when no search query */}
                {!isSearchingDropoff && dropoffSuggestions.length === 0 && !dropoff.trim() && (
                  <>
                    {/* City Tabs */}
                    <div className="city-tabs-container">
                      <div className="city-tabs">
                        {CITY_TABS.map(city => (
                          <button
                            key={city.id}
                            className={`city-tab ${selectedCity === city.id ? 'active' : ''}`}
                            onClick={() => { setSelectedCity(city.id); setSelectedArea('All'); }}
                          >
                            {city.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Area Chips */}
                    <div className="area-chips-container">
                      <div className="area-chips">
                        {areaKeys.map(area => (
                          <button
                            key={area}
                            className={`area-chip ${selectedArea === area ? 'active' : ''}`}
                            onClick={() => setSelectedArea(area)}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Places List */}
                    {Object.entries(getAreaPlaces()).map(([area, places]) => (
                      <div key={area}>
                        <div className="area-header">{area}</div>
                        {places.map((loc, i) => (
                          <div key={i} className="suggestion-item" onClick={() => { setDropoff(loc); setIsDropoffOpen(false); }}>
                            <Navigation size={13} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{loc}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                )}
                {/* Grouped search results when user types but no nominatim results */}
                {!isSearchingDropoff && dropoffSuggestions.length === 0 && dropoff.trim() && getGroupedDropoff(dropoff) &&
                  Object.entries(getGroupedDropoff(dropoff)).map(([area, places]) => (
                    <div key={area}>
                      <div className="area-header">{area}</div>
                      {places.map((loc, i) => (
                        <div key={i} className="suggestion-item" onClick={() => { setDropoff(loc); setIsDropoffOpen(false); }}>
                          <Navigation size={13} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{loc}</span>
                        </div>
                      ))}
                    </div>
                  ))
                }
                {!isSearchingDropoff && dropoffSuggestions.length === 0 && dropoff.trim() && getGroupedDropoff(dropoff) && Object.keys(getGroupedDropoff(dropoff)).length === 0 && (
                  <div className="loading-text">No locations found.</div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Calculating...' : 'See Prices'}
          </button>
        </form>

        {/* Estimates */}
        {estimate?.options && (
          <div className="estimations-container animate-fade-in-up">
            <div className="estimations-header">
              <span>Available Rides</span>
              <span style={{ display: 'flex', gap: '0.75rem' }}>
                <span>📍 {estimate.distance}</span>
                <span>⏱ {estimate.duration}</span>
              </span>
            </div>
            <div className="estimations-list">
              {estimate.options.map(opt => (
                <div key={opt.id} onClick={() => setSelectedOption(opt)} className={`estimation-option ${selectedOption?.id === opt.id ? 'selected' : 'unselected'}`}>
                  <div className="estimation-icon">{opt.iconUrl}</div>
                  <div className="estimation-details">
                    <div className="estimation-type">{opt.type}</div>
                    <div className="estimation-desc">{opt.description} • {opt.eta}</div>
                  </div>
                  <div className="estimation-price">{estimate.currency}{opt.price}</div>
                </div>
              ))}
            </div>
            {selectedOption && (
              <>
                {!user && (
                  <div className="ride-form-error" style={{ marginBottom: '1rem' }}>
                    Please login or create an account before booking a ride.
                  </div>
                )}
                <button
                  onClick={handleConfirmRide}
                  className="btn btn-primary book-btn animate-fade-in-up"
                  disabled={!user || loading}
                >
                  {loading ? 'Booking...' : `Book ${selectedOption.type}`}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Pickup Map Modal ── */}
      {showPickupMap && (
        <MapPickerModal
          title="Set Pickup Location"
          icon={MapPin}
          iconColor="#22C55E"
          markerIcon={greenIcon}
          initialPosition={pickupCoords || [26.8467, 80.9462]}
          onConfirm={(addr, coords) => { setPickup(addr); setPickupCoords(coords); setShowPickupMap(false); }}
          onClose={() => setShowPickupMap(false)}
        />
      )}

      {/* ── Dropoff Map Modal ── */}
      {showDropoffMap && (
        <MapPickerModal
          title="Set Drop Location"
          icon={Navigation}
          iconColor="#EF4444"
          markerIcon={redIcon}
          initialPosition={pickupCoords || [26.8467, 80.9462]}
          onConfirm={(addr, coords) => { setDropoff(addr); setShowDropoffMap(false); }}
          onClose={() => setShowDropoffMap(false)}
        />
      )}
    </>
  );
};

export default RideForm;

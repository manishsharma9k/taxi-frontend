import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Phone,
  ShieldCheck,
  Star,
  X,
  Loader2,
  MessageCircle,
  MapPin,
} from "lucide-react";
import Swal from "sweetalert2";
import PaymentGateway from "./PaymentGateway";
import RideChat from "./RideChat";
import "./CSS/LiveTrackingMap.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../api.js";

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const captainIcon = new L.DivIcon({
  html: `<div style="background:#FFD700;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏍️</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const LiveTrackingMap = ({ rideDetails, onCancel }) => {
  const defaultCenter = [26.8467, 80.9462];
  const { token } = useContext(AuthContext) || {
    token: localStorage.getItem("qr_token"),
  };

  const [pickupPos, setPickupPos] = useState(
    rideDetails?.pickupCoords || defaultCenter,
  );
  const [captainPos, setCaptainPos] = useState(
    rideDetails?.captain?.location?.lat && rideDetails?.captain?.location?.lng
      ? [rideDetails.captain.location.lat, rideDetails.captain.location.lng]
      : null,
  );

  const [eta, setEta] = useState(7);
  const [showPayment, setShowPayment] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [status, setStatus] = useState(rideDetails?.status || "pending");
  const [captain, setCaptain] = useState(rideDetails?.captain || null);
  const [rideOtp, setRideOtp] = useState(rideDetails?.otp || null);
  const [nearbyCaptains, setNearbyCaptains] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [mapRef, setMapRef] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  const activeDriverPos = captainPos || defaultCenter;

  const mapCenter = useMemo(() => {
    if (captainPos) {
      return [
        (captainPos[0] + pickupPos[0]) / 2,
        (captainPos[1] + pickupPos[1]) / 2,
      ];
    }
    return pickupPos;
  }, [captainPos, pickupPos]);

  // If pickup coordinates are not passed from booking, geocode from pickup text
  useEffect(() => {
    if (rideDetails?.pickupCoords || !rideDetails?.pickupLocation) return;

    let ignore = false;
    const geocodePickup = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(rideDetails.pickupLocation)}&limit=1`,
        );
        const data = await res.json();
        if (!ignore && data?.[0]?.lat && data?.[0]?.lon) {
          setPickupPos([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch {
        // keep default center
      }
    };

    geocodePickup();
    return () => {
      ignore = true;
    };
  }, [rideDetails?.pickupCoords, rideDetails?.pickupLocation]);

  // Fetch nearby captains around pickup position
  useEffect(() => {
    const fetchNearby = () => {
      fetch(
        `${API_URL}/api/captains/nearby?lat=${pickupPos[0]}&lng=${pickupPos[1]}&radius=15&vehicleType=${rideDetails?.id || ""}`,
      )
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setNearbyCaptains(d))
        .catch(() => {});
    };
    fetchNearby();
    const id = setInterval(fetchNearby, 10000);
    return () => clearInterval(id);
  }, [rideDetails?.id, pickupPos]);

  // Poll ride and captain live location
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!rideDetails?.rideId) return;

      try {
        const res = await fetch(`${API_URL}/api/rides/${rideDetails.rideId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const updatedRide = await res.json();
        setStatus(updatedRide.status);
        if (updatedRide.otp) setRideOtp(updatedRide.otp);

        if (updatedRide.captain) {
          setCaptain({
            id: updatedRide.captain._id,
            name: updatedRide.captain.name,
            phone: updatedRide.captain.phone,
            car: updatedRide.captain.vehicleType,
            plate: updatedRide.captain.vehicleNumber,
            rating: updatedRide.captain.rating,
            photo: updatedRide.captain.photo,
            location: updatedRide.captain.location,
          });

          if (
            updatedRide.captain.location?.lat &&
            updatedRide.captain.location?.lng
          ) {
            setCaptainPos([
              updatedRide.captain.location.lat,
              updatedRide.captain.location.lng,
            ]);
          }
        }

        if (updatedRide.status === "completed" && !isCompleted) {
          setIsCompleted(true);
          setShowPayment(true);
        }
      } catch {
        // ignore transient polling errors
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [rideDetails, token, isCompleted]);

  // Estimate ETA from distance to pickup
  useEffect(() => {
    if (!captainPos) return;
    const km = haversineKm(
      captainPos[0],
      captainPos[1],
      pickupPos[0],
      pickupPos[1],
    );
    const minutes = Math.max(1, Math.ceil((km / 25) * 60)); // assumed avg city speed ~25km/h
    setEta(minutes);
  }, [captainPos, pickupPos]);

  // Build road route from captain -> pickup using OSRM
  useEffect(() => {
    if (!captainPos || !pickupPos) {
      setRoutePath([]);
      return;
    }

    let ignore = false;
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${captainPos[1]},${captainPos[0]};${pickupPos[1]},${pickupPos[0]}?overview=full&geometries=geojson`,
        );
        const data = await res.json();
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        if (!ignore && Array.isArray(coords)) {
          setRoutePath(coords.map(([lng, lat]) => [lat, lng]));
        }
      } catch {
        if (!ignore) setRoutePath([]);
      }
    };

    fetchRoute();
    const id = setInterval(fetchRoute, 12000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, [captainPos, pickupPos]);

  const handleCancelRide = async () => {
    if (!rideDetails?.rideId) return onCancel();

    const { value: cancelReason } = await Swal.fire({
      title: "Cancel Ride",
      input: "text",
      inputLabel: "Reason for cancellation",
      inputPlaceholder: "E.g., Driver is too far, changed my mind...",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, cancel it",
      inputValidator: (value) => {
        if (!value) {
          return "You need to write a reason!";
        }
      },
    });

    if (!cancelReason) return;

    setIsCancelling(true);
    try {
      const res = await fetch(`${API_URL}/api/rides/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rideId: rideDetails.rideId, cancelReason }),
      });

      if (res.ok) {
        Swal.fire("Cancelled!", "Your ride has been cancelled.", "success");
        onCancel();
      } else {
        const data = await res.json();
        Swal.fire("Error", data.message || "Failed to cancel ride.", "error");
      }
    } catch {
      Swal.fire("Error", "Network error. Could not cancel ride.", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="animate-fade-in-up live-map-container">
      {/* Interactive Live Map Section */}
      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          ref={setMapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* User pickup location */}
          <Marker position={pickupPos}>
            <Popup>Your Pickup Location</Popup>
          </Marker>

          {/* Assigned captain live location */}
          {captainPos && (
            <Marker position={captainPos} icon={captainIcon}>
              <Popup>
                {captain?.name
                  ? `${captain.name} is arriving`
                  : "Captain is arriving"}
              </Popup>
            </Marker>
          )}

          {/* Road route captain -> pickup */}
          {routePath.length > 1 && (
            <Polyline
              positions={routePath}
              pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.85 }}
            />
          )}

          {/* Nearby Captains */}
          {nearbyCaptains.map((c) =>
            c.location?.lat && c.location?.lng ? (
              <Marker
                key={c._id}
                position={[c.location.lat, c.location.lng]}
                icon={captainIcon}
              >
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#666",
                        marginTop: 2,
                      }}
                    >
                      {c.vehicleType} • {c.vehicleNumber}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#f59e0b",
                        marginTop: 2,
                      }}
                    >
                      ⭐ {c.rating}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "#22c55e",
                        marginTop: 2,
                      }}
                    >
                      ● Online
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null,
          )}

          <Circle
            center={pickupPos}
            radius={10000}
            pathOptions={{
              color: "#FFD700",
              fillColor: "#FFD700",
              fillOpacity: 0.04,
              weight: 1,
              dashArray: "6",
            }}
          />
        </MapContainer>

        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={handleCancelRide}
            title="Cancel Ride"
            className="cancel-ride-btn"
          >
            {isCancelling ? (
              <Loader2
                size={20}
                style={{ animation: "spin 2s linear infinite" }}
              />
            ) : (
              <X size={20} />
            )}
          </button>
          <button
            onClick={() => mapRef?.setView(activeDriverPos, 16)}
            title="Recenter on Captain"
            className="recenter-btn"
          >
            <MapPin size={20} />
          </button>
        </div>

        <div className="hud-display">
          Tracking {rideDetails?.type || "Vehicle"}
        </div>
      </div>

      {/* Driver Information Terminal */}
      <div className="terminal-section">
        <h4
          className="terminal-title"
          style={{ color: eta > 1 ? "var(--text-main)" : "var(--primary)" }}
        >
          {status === "pending" ? (
            <>
              Ride Booked! Waiting for Captain...{" "}
              <Loader2
                size={16}
                style={{ animation: "spin 2s linear infinite" }}
              />
            </>
          ) : eta > 1 ? (
            <>
              Driver arriving in ~{eta} min{" "}
              {eta % 2 === 0 ? (
                <Loader2
                  size={16}
                  style={{ animation: "spin 2s linear infinite" }}
                />
              ) : (
                ""
              )}
            </>
          ) : (
            "Driver has arrived!"
          )}
        </h4>

        <div
          className="driver-info-card"
          style={{ opacity: status === "pending" ? 0.5 : 1 }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div className="driver-avatar">
              {captain?.photo ? (
                <img
                  src={captain.photo}
                  alt="Captain"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "🧔🏽"
              )}
            </div>
            <div>
              <h4 className="driver-name">{captain?.name || "Searching..."}</h4>
              <div className="driver-rating">
                <Star size={14} fill="var(--primary)" color="var(--primary)" />{" "}
                {captain?.rating || "4.9"} •{" "}
                {captain?.car || captain?.vehicleType || rideDetails?.type}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div className="driver-plate">
              {captain?.plate || captain?.vehicleNumber || "----"}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "0.7rem",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          Payment Method: {(rideDetails?.paymentMethod || "cash").toUpperCase()}
        </div>

        {status === "accepted" && rideOtp && (
          <div
            className="animate-fade-in-up"
            style={{
              margin: "1.5rem 0",
              padding: "1rem",
              background: "rgba(250, 204, 21, 0.1)",
              border: "1px dashed var(--primary)",
              borderRadius: "0.75rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Share OTP to start ride
            </p>
            <h1
              style={{
                margin: "0.5rem 0 0 0",
                color: "var(--primary)",
                letterSpacing: "8px",
                fontSize: "2.5rem",
                fontWeight: "800",
              }}
            >
              {rideOtp}
            </h1>
          </div>
        )}

        <div className="terminal-actions">
          <button className="action-btn btn-safety">
            <ShieldCheck size={18} /> Safety
          </button>
          <button
            className="action-btn btn-chat"
            onClick={() => setShowChat(true)}
            style={{
              pointerEvents: !captain ? "none" : "auto",
              opacity: !captain ? 0.5 : 1,
            }}
          >
            <MessageCircle size={18} /> Chat
          </button>
          <a
            href={`tel:${captain?.phone || ""}`}
            className="action-btn btn-call"
            style={{
              pointerEvents: !captain ? "none" : "auto",
              opacity: !captain ? 0.5 : 1,
            }}
          >
            <Phone size={18} /> Call
          </a>
        </div>

        {!isCompleted && (
          <button
            onClick={handleCancelRide}
            disabled={isCancelling}
            className="btn cancel-action-btn"
          >
            {isCancelling ? "Cancelling..." : "Cancel Ride"}
          </button>
        )}
        {eta <= 1 && !isCompleted && (
          <button
            onClick={() => {
              setIsCompleted(true);
              setShowPayment(true);
            }}
            className="btn btn-success complete-action-btn"
          >
            Complete Ride
          </button>
        )}
        {isCompleted && (
          <button
            onClick={() => setShowPayment(true)}
            className="btn btn-primary pay-action-btn"
          >
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

      {/* Chat Overlay */}
      {showChat && (
        <RideChat
          rideId={rideDetails?.rideId}
          senderId={rideDetails?.userId || "user"}
          receiverId={captain?.id || "captain"}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default LiveTrackingMap;

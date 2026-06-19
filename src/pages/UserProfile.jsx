import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";
import { MapPin, Clock, CheckCircle, XCircle, User, LogOut, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

const UserProfile = () => {
  const { user, token, logout, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchRides = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/rides/user-rides`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRides(data);
        }
      } catch (err) {
        console.error("Failed to fetch rides:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [token]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, log out",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/");
      }
    });
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: "80px", paddingBottom: "40px" }}>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem" }}>
        
        {/* Profile Header */}
        <div className="animate-fade-in-up" style={{ background: "var(--card)", padding: "2rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem", position: "relative" }}>
          <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ color: "#ef4444", gap: "0.5rem" }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
          
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary)", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "1rem" }}>
            <User size={40} color="#111" />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "0.5rem" }}>{user.name}</h1>
          <div style={{ display: "flex", gap: "1rem", color: "var(--text-3)", fontSize: "0.9rem" }}>
            <span>{user.phone}</span>
            <span>•</span>
            <span>{user.email || "No email provided"}</span>
          </div>
        </div>

        {/* Ride History */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={20} color="var(--primary)" /> Ride History
          </h2>

          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-3)" }}>Loading rides...</div>
          ) : rides.length === 0 ? (
            <div style={{ background: "var(--card)", padding: "3rem 2rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", textAlign: "center" }}>
              <p style={{ color: "var(--text-2)", marginBottom: "1.5rem" }}>You haven't booked any rides yet.</p>
              <button onClick={() => navigate("/")} className="btn btn-primary">
                Book a Ride <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {rides.map((ride) => (
                <div key={ride._id} style={{ background: "var(--card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  
                  {/* Header: Date & Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>
                      {new Date(ride.createdAt).toLocaleString()}
                    </span>
                    <span style={{ 
                      fontSize: "0.8rem", 
                      fontWeight: "600", 
                      padding: "0.25rem 0.6rem", 
                      borderRadius: "100px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      background: ride.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : ride.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: ride.status === 'completed' ? '#10b981' : ride.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                    }}>
                      {ride.status === 'completed' ? <CheckCircle size={14} /> : ride.status === 'cancelled' ? <XCircle size={14} /> : <Clock size={14} />}
                      {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </span>
                  </div>

                  {/* Locations */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "24px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--primary)" }}></div>
                        <div style={{ width: "2px", height: "30px", background: "var(--border)", margin: "4px 0" }}></div>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }}></div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, gap: "1rem" }}>
                        <div>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "0.2rem" }}>PICKUP</p>
                          <p style={{ fontSize: "0.95rem", color: "var(--text)" }}>{ride.pickup}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "0.2rem" }}>DROPOFF</p>
                          <p style={{ fontSize: "0.95rem", color: "var(--text)" }}>{ride.dropoff}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px dashed var(--border)" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "1.2rem" }}>
                        {ride.vehicleType === 'bike' ? '🏍️' : ride.vehicleType === 'auto' ? '🛺' : '🚗'}
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-2)", textTransform: "capitalize" }}>{ride.vehicleType}</span>
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text)" }}>
                      ₹{ride.fare}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

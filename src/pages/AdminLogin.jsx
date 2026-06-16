import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { API_URL } from '../api.js';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, go to dashboard
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    
    Swal.fire({
      title: 'Confirm Login',
      text: "Are you sure you want to log in as Admin?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f9c935',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, log in',
      cancelButtonText: 'No, cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        setError('');
        
        try {
          const res = await axios.post(`${API_URL}/api/auth/admin-login`, {
            email,
            password
          });
          
          if (res.data.token) {
            localStorage.setItem('adminToken', res.data.token);
            localStorage.setItem('adminName', res.data.name || 'Admin');
            localStorage.setItem('adminEmail', res.data.email || '');
            toast.success("Welcome to Admin Dashboard");
            navigate('/dashboard');
          }
        } catch (err) {
          const errMsg = err.response?.data?.message || err.message || "Login failed";
          setError(errMsg);
          toast.error(errMsg);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="container" style={{ minHeight: '80vh', paddingTop: '6rem', display: 'flex', alignItems: 'center' }}>
      <Toaster position="top-right" />

      <div className="admin-login-wrapper" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="admin-left glass-panel" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1 className="title" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>Welcome to Admin</h1>
          <p className="subtitle" style={{ marginBottom: '1rem' }}>Manage drivers, rides and users securely — your control center for QuickRide.</p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-outline">Learn More</button>
          </div>

          <div style={{ marginTop: '1.2rem', color: 'var(--text-3)', fontSize: '0.95rem' }}>
            <strong style={{ color: 'var(--text)' }}>Secure • Fast • Audited</strong>
            <div style={{ marginTop: '0.6rem' }}>Two-factor authentication supported. All admin actions are logged.</div>
          </div>
        </div>

        <div className="admin-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in-up" style={{ padding: '2.5rem', width: '100%', maxWidth: '460px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text)', textAlign: 'left' }}>Admin Portal</h2>
            <p style={{ color: 'var(--text-2)', marginBottom: '1.5rem', textAlign: 'left' }}>Restricted Access Only</p>

            {error && <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-2)' }}>Admin Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="admin@taxinova.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-2)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', fontSize: '1rem', marginTop: '0.4rem' }} disabled={loading}>
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

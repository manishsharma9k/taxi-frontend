import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { API_URL } from '../api.js';

const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API_URL}/api/captains/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message); return; }
      setMsg(data.message);
      setStep(2);
    } catch { setErr('Network error'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setErr('Enter 6-digit OTP'); return; }
    if (newPassword.length < 6) { setErr('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setErr('Passwords do not match'); return; }
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API_URL}/api/captains/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message); return; }
      setMsg('Password reset successfully! You can now login.');
      setTimeout(onClose, 2000);
    } catch { setErr('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in-up" style={{ padding: '2rem', width: '100%', maxWidth: '380px' }}>
        <h3 style={{ fontWeight: '800', fontSize: '1.3rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>Reset Password</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {step === 1 ? 'Enter your registered email. OTP will be sent to your phone.' : `OTP sent to your registered phone. Enter it below.`}
        </p>

        {err && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{err}</div>}
        {msg && !err && <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{msg}</div>}

        <form onSubmit={step === 1 ? handleSendOtp : handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {step === 1 ? (
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" className="input-field" placeholder="captain@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }} required />
            </div>
          ) : (
            <>
              <input type="text" className="input-field" placeholder="6-digit OTP" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value)} autoFocus
                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.1rem' }} required />
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showNew ? 'text' : 'password'} className="input-field" placeholder="New password (min 6 chars)"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} required />
                <div onClick={() => setShowNew(p => !p)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showConfirm ? 'text' : 'password'} className="input-field" placeholder="Confirm new password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} required />
                <div onClick={() => setShowConfirm(p => !p)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.5rem' }}>Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '-0.5rem' }}>✓ Passwords match</p>
              )}
            </>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? '...' : step === 1 ? 'Send OTP' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CaptainLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const { loginCaptain, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'captain') {
      navigate('/captain-panel');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await loginCaptain(email, password);
      if (data.approvalStatus === 'pending') {
        setError('Your account is pending admin approval. Please wait.');
        return;
      }
      if (data.approvalStatus === 'rejected') {
        setError('Your application has been rejected. Contact support for details.');
        return;
      }
      navigate('/captain-panel');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', paddingTop: '8rem' }}>
      <div className="glass-panel animate-fade-in-up" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Captain Login</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Log in to access your Captain Dashboard</p>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="input-field"
                placeholder="captain@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
              <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Forgot password?</button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '1rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Captain'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Not registered as a captain? <Link to="/drive" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Register now</Link>
        </p>
      </div>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
};

export default CaptainLogin;

import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Smartphone, Lock } from 'lucide-react';

const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1=phone, 2=otp+newpass
  const [phone, setPhone] = useState('');
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
    if (phone.length !== 10) { setErr('Enter a valid 10-digit phone number'); return; }
    setLoading(true); setErr('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
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
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword }),
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
      <div className="animate-fade-in-up" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: '380px' }}>
        <h3 style={{ fontWeight: '800', fontSize: '1.3rem', marginBottom: '0.35rem' }}>Reset Password</h3>
        <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {step === 1 ? 'Enter your registered phone number to receive an OTP.' : `OTP sent to ${phone}. Enter it below.`}
        </p>

        {err && <div style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', padding: '0.6rem 0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid rgba(239,68,68,0.2)' }}>{err}</div>}
        {msg && !err && <div style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', padding: '0.6rem 0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid rgba(34,197,94,0.2)' }}>{msg}</div>}

        <form onSubmit={step === 1 ? handleSendOtp : handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {step === 1 ? (
            <div style={{ position: 'relative' }}>
              <Smartphone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="tel" className="input-field" placeholder="10-digit mobile number" maxLength={10}
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
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
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? '...' : step === 1 ? 'Send OTP' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const { login, initLogin, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInit = async (e) => {
    e.preventDefault();
    if (!phone || !password || phone.length !== 10) {
      setError("Please fill all fields and enter a 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await initLogin(phone, password);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(phone, password, otp);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem 2rem', background: 'var(--bg)' }}>
      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '400px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginTop: '0.35rem' }}>Log in to your TaxiNova account</p>
        </div>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', padding: '0.65rem 0.85rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
        
        <form onSubmit={step === 1 ? handleInit : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {step === 1 ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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
                  <div 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Verification Code (OTP)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter 6-digit OTP (e.g. 123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem' }}
              />
              <p style={{marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center'}}>
                 A verification code has been sent to <strong>{phone}</strong>
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '1.05rem', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? (step === 1 ? 'Verifying Credentials...' : 'Logging In...') : (step === 1 ? 'Continue' : 'Verify & Log In')}
          </button>
        </form>
        
        <p style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-3)' }}>
          Don't have an account? <Link to="/signup" className="text-primary" style={{ textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
        </p>
      </div>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
};

export default Login;

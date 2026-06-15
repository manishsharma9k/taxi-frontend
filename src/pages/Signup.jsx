import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup, sendOtp, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address");
        return;
      }
    }
    if (step === 2 && (!phone || phone.length !== 10 || isNaN(phone))) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (step === 3) {
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setLoading(true);
      setError('');
      try {
        await sendOtp(phone);
        setStep(4);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    setError('');
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError('');

    try {
      await signup(name, email, phone, password, otp);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem 2rem', background: 'var(--bg)' }}>
      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '450px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>

        {/* Progress Indication */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '0', right: '0', height: '2px', background: '#333', zIndex: '0' }}>
            <div style={{ width: step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%', height: '100%', background: 'var(--primary)', transition: 'width 0.4s ease' }}></div>
          </div>

          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 1 ? 'var(--primary)' : '#333', color: step >= 1 ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: '1', transition: 'all 0.4s', boxShadow: step === 1 ? '0 0 15px rgba(249,201,53,0.5)' : 'none' }}>
            {step > 1 ? <Check size={18} /> : 1}
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 2 ? 'var(--primary)' : '#333', color: step >= 2 ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: '1', transition: 'all 0.4s', boxShadow: step === 2 ? '0 0 15px rgba(249,201,53,0.5)' : 'none' }}>
            {step > 2 ? <Check size={18} /> : 2}
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 3 ? 'var(--primary)' : '#333', color: step >= 3 ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: '1', transition: 'all 0.4s', boxShadow: step === 3 ? '0 0 15px rgba(249,201,53,0.5)' : 'none' }}>
            {step > 3 ? <Check size={18} /> : 3}
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 4 ? 'var(--primary)' : '#333', color: step >= 4 ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: '1', transition: 'all 0.4s', boxShadow: step === 4 ? '0 0 15px rgba(249,201,53,0.5)' : 'none' }}>
            4
          </div>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>Create account</h2>
        <p style={{ color: 'var(--text-3)', marginBottom: '2rem', fontSize: '0.875rem' }}>
          {step === 1 ? "Let's start with your name." : step === 2 ? "What's your mobile number?" : step === 3 ? "Secure your account." : "Verify your mobile number."}
        </p>

        {error && <div className="animate-fade-in-up" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={step === 4 ? handleSubmit : handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {step === 1 && (
            <div className="animate-fade-in-up" style={{ animationDuration: '0.3s', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Mobile Number</label>
              <input
                type="tel"
                className="input-field"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                required
                autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in-up" style={{ animationDuration: '0.3s', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="••••••••"
                    style={{ paddingRight: '2.5rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.8rem', top: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="••••••••"
                    style={{ paddingRight: '2.5rem' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '0.8rem', top: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.35rem' }}>Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '0.35rem' }}>✓ Passwords match</p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
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
              {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>{error}</div>}
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                A verification code has been sent to <strong>{phone}</strong>
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            {step > 1 && (
              <button type="button" onClick={handleBack} className="btn btn-outline" style={{ flex: 1, padding: '0.75rem' }}>
                <ChevronLeft size={20} /> Back
              </button>
            )}

            {step < 4 ? (
              <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.75rem' }} disabled={loading && step === 3}>
                {loading && step === 3 ? 'Sending OTP...' : 'Continue'} <ChevronRight size={20} />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.75rem' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Finish Sign Up'} <Check size={20} style={{ marginLeft: '4px' }} />
              </button>
            )}
          </div>
        </form>

        <p style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-3)' }}>
          Already have an account? <Link to="/login" className="text-primary" style={{ textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

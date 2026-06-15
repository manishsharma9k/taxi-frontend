import React, { useState, useRef, useContext, useEffect } from 'react';
import { ShieldCheck, Clock, Wallet, CheckCircle, CarFront, Download, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { usePageContent } from '../hooks/usePageContent';
import './DrivePage.css';

const DrivePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pageContent } = usePageContent('/drive');

  useEffect(() => {
    if (user && user.role === 'user') {
      navigate('/');
    }
  }, [user, navigate]);

  const formRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    gender: '',
    city: '',
    vehicleType: '',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleColor: '',
    rcNumber: '',
    aadhaarNumber: '',
    dlNumber: '',
    panNumber: '',
    photo: '',
    vehiclePhoto: '',
    otp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleVehiclePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, vehiclePhoto: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // target first input
      setTimeout(() => {
        const input = formRef.current.querySelector('input');
        if (input) input.focus();
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (step === 1) {
      if (formData.password !== confirmPassword) {
        setMessage({ text: 'Passwords do not match', type: 'error' });
        setLoading(false);
        return;
      }
      setStep(2);
      setLoading(false);
      return;
    }

    if (step === 2) {
      try {
        const res = await fetch('http://localhost:5000/api/captains/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone })
        });
        const data = await res.json();
        if (res.ok) {
          setStep(3);
        } else {
          setMessage({ text: data.message || 'Error sending OTP.', type: 'error' });
        }
      } catch (err) {
        setMessage({ text: 'Network error. Make sure backend is running.', type: 'error' });
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/captains/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStep('done');
      } else {
        setMessage({ text: data.message || 'Error submitting application.', type: 'error' });
      }
    } catch (err) {
      console.error("Captain Registration Error:", err);
      setMessage({ text: err.message || 'Network error. Make sure the backend server is running.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: 'clamp(4rem, 6vw, 8rem)', paddingBottom: 'clamp(3rem, 5vw, 6rem)', overflow: 'hidden', background: 'var(--bg)' }}>
        <div className="container features-grid drive-form-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', justifyItems: 'center', textAlign: 'center' }}>
          
          <div className="animate-fade-in-up" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }} className="ml-60">
              <img
                src="/images/taxinova_logo.png"
                alt="TaxiNova Logi"
                style={{ height: '130px', width: '130px', objectFit: 'contain', filter: 'drop-shadow(0 6px 20px rgba(249,201,53,0.5))' }}
              />
            </div>
            <h1 className="title">
              Become a <span className="text-primary">Captain</span> <br/>
              and earn on your own terms.
            </h1>
            <p className="subtitle delay-100 animate-fade-in-up" style={{ animationFillMode: 'both' }}>
              Zero registration fees. Daily payouts. Flexible timings. Join India's fastest-growing ride-sharing network and start earning today.
            </p>
            
            <div className="delay-200 animate-fade-in-up" style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', animationFillMode: 'both', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={scrollToForm} className="btn btn-primary" style={{ padding: 'clamp(0.6rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', minWidth: '200px' }}>
                <CheckCircle size={20} /> Register as Captain
              </button>
            </div>
          </div>

          {pageContent && (
            <section style={{ padding: '3rem 2rem', marginTop: '2rem', background: 'var(--bg)', borderRadius: '24px', border: '1px solid var(--border)' }}>
              <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>{pageContent.title}</h2>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: pageContent.content }} />
              </div>
            </section>
          )}

          <div ref={formRef} className="delay-300 animate-fade-in-up glass-panel drive-form-section" style={{ padding: 'clamp(1.25rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem)', textAlign: 'center', animationFillMode: 'both', maxWidth: '800px', margin: '0 auto' }}>
             <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Earn up to <span className="text-primary">₹30,000/mo</span></h2>
             <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign up takes less than 2 minutes. Enter your details to get started.</p>
             
             {message.text && (
               <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem', background: message.type === 'success' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: message.type === 'success' ? '#2ecc71' : '#e74c3c', border: `1px solid ${message.type === 'success' ? '#2ecc71' : '#e74c3c'}` }}>
                 {message.text}
               </div>
             )}

             {step === 'done' ? (
               <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
                 <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>⏳</div>
                 <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>Registration Submitted!</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                   Your captain profile is under review. Admin will approve your account — usually within 2 hours. You'll be able to login once approved.
                 </p>
                 <div style={{ background: 'rgba(249,201,53,0.08)', border: '1px solid rgba(249,201,53,0.2)', borderRadius: '10px', padding: '0.85rem 1.2rem', width: '100%', textAlign: 'left' }}>
                   <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>What happens next?</div>
                   <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 2 }}>
                     <li>Admin reviews your documents</li>
                     <li>Account gets approved ✅</li>
                     <li>Login &amp; start earning 🚀</li>
                   </ul>
                 </div>
                 <Link to="/captain-login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', marginTop: '0.5rem' }}>Go to Captain Login</Link>
               </div>
             ) : (
               <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>
               <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: 'center' }}>
                 {[1,2,3].map(s => (
                   <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= s ? 'var(--primary)' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />
                 ))}
               </div>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'left', marginBottom: '0.25rem' }}>
                 {step === 1 ? 'Step 1 of 3 — Personal Details' : step === 2 ? 'Step 2 of 3 — Vehicle & Documents' : 'Step 3 of 3 — Verify OTP'}
               </p>

               {step === 1 && (
                 <>
                   <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="input-field" required />
                   <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="input-field" required />
                   <div style={{ position: 'relative' }}>
                     <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="input-field" required minLength="6" style={{ paddingRight: '2.5rem' }} />
                     <div onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </div>
                   </div>
                   <div style={{ position: 'relative' }}>
                     <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="input-field" required style={{ paddingRight: '2.5rem' }} />
                     <div onClick={() => setShowConfirmPassword(p => !p)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                       {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </div>
                   </div>
                   {confirmPassword && formData.password !== confirmPassword && (
                     <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.5rem', textAlign: 'left' }}>Passwords do not match</p>
                   )}
                   {confirmPassword && formData.password === confirmPassword && (
                     <p style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '-0.5rem', textAlign: 'left' }}>✓ Passwords match</p>
                   )}
                   <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="input-field" required maxLength={10} />
                   <div style={{ display: 'flex', gap: '0.75rem' }}>
                     <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field" style={{ flex: 1 }} title="Date of Birth" required />
                     <select name="gender" value={formData.gender} onChange={handleChange} className="input-field" style={{ flex: 1, appearance: 'none' }} required>
                       <option value="" disabled>Gender</option>
                       <option value="male">Male</option>
                       <option value="female">Female</option>
                       <option value="other">Other</option>
                     </select>
                   </div>
                   <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City (e.g. Lucknow)" className="input-field" required />
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', textAlign: 'left' }}>
                     <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Profile Photo</label>
                     <input type="file" accept="image/*" onChange={handlePhotoChange} className="input-field" style={{ padding: '0.75rem' }} />
                     {formData.photo && <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>✓ Photo attached</div>}
                   </div>
                   <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', justifyContent: 'center' }}>
                     Next →
                   </button>
                 </>
               )}

               {step === 2 && (
                 <div className="animate-fade-in-up">
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'left', fontWeight: '600' }}>Vehicle Details</p>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                     <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="input-field" required style={{ appearance: 'none' }}>
                       <option value="" disabled>Select Vehicle Type</option>
                       <option value="bike">Bike</option>
                       <option value="auto">Auto Rickshaw</option>
                       <option value="cab">Cab</option>
                     </select>
                     <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="Vehicle Number (e.g. UP32 AB 1234)" className="input-field" required />
                     <div style={{ display: 'flex', gap: '0.75rem' }}>
                       <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Vehicle Model (e.g. Splendor)" className="input-field" style={{ flex: 1 }} />
                       <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="Color (e.g. Black)" className="input-field" style={{ flex: 1 }} />
                     </div>
                     <input type="text" name="rcNumber" value={formData.rcNumber} onChange={handleChange} placeholder="RC Number" className="input-field" />
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', textAlign: 'left' }}>
                       <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vehicle Photo</label>
                       <input type="file" accept="image/*" onChange={handleVehiclePhotoChange} className="input-field" style={{ padding: '0.75rem' }} />
                       {formData.vehiclePhoto && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <img src={formData.vehiclePhoto} alt="Vehicle" style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(249,201,53,0.3)' }} />
                           <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>✓ Vehicle photo attached</div>
                         </div>
                       )}
                     </div>
                   </div>

                   <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '1rem 0 0.5rem', textAlign: 'left', fontWeight: '600' }}>Documents</p>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                     <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="Aadhaar Number (12 digits)" className="input-field" maxLength={12} />
                     <input type="text" name="dlNumber" value={formData.dlNumber} onChange={handleChange} placeholder="Driving License Number" className="input-field" />
                     <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="PAN Number (optional)" className="input-field" maxLength={10} />
                   </div>

                   <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                     <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.8rem' }}>← Back</button>
                     <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.8rem' }}>
                       {loading ? 'Sending OTP...' : 'Send OTP & Continue →'}
                     </button>
                   </div>
                 </div>
               )}

               {step === 3 && (
                 <div className="animate-fade-in-up">
                   <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>OTP sent to <strong>+91 {formData.phone}</strong></p>
                   <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="Enter 6-digit OTP" maxLength={6} className="input-field" required style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }} />
                   <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1.5rem', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                     {loading ? 'Registering...' : 'Complete Registration'}
                   </button>
                   <button type="button" onClick={() => setStep(2)} className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', padding: '0.8rem' }}>← Back</button>
                 </div>
               )}

               <div style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                 Already have an account? <Link to="/captain-login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link>
               </div>
               </form>
             )}
          </div>
          
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-2)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Why drive with <span className="text-primary">TaxiNova?</span></h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>We provide the best benefits in the industry for our Captains.</p>
          </div>
          
          <div className="services-grid">
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: '1rem', background: 'rgba(249, 201, 53, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <Wallet size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Daily Payouts</h3>
              <p style={{ color: 'var(--text-muted)' }}>Get your earnings transferred directly to your bank account every single day.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ padding: '1rem', background: 'rgba(249, 201, 53, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <Clock size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Flexible Timings</h3>
              <p style={{ color: 'var(--text-muted)' }}>You are your own boss. You decide when, where, and how long you want to drive.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ padding: '1rem', background: 'rgba(249, 201, 53, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Insured Rides</h3>
              <p style={{ color: 'var(--text-muted)' }}>Both you and your vehicle are covered with accidental insurance on active rides.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Matrix Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="features-grid">
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Get started in <br/><span className="text-primary">3 simple steps</span></h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We've made the onboarding journey as easy as taking a ride.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                   <div style={{ background: 'var(--primary)', color: '#111', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                   <div>
                     <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Register Online</h4>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill up the quick registration form above.</p>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                   <div style={{ background: 'var(--primary)', color: '#111', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                   <div>
                     <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Upload Documents</h4>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload your Aadhar, Driving License, and RC via the app.</p>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                   <div style={{ background: 'var(--primary)', color: '#111', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                   <div>
                     <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Start Earning!</h4>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Get verified in 2 hours and go online to accept rides.</p>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', border: 'none' }}>
              <Download size={48} color="#ffffff" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff' }}>Download Captain App</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: '2rem' }}>You can also register directly from our dedicated Captain application.</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
                  Play Store
                </button>
                <button className="btn" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
                  App Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DrivePage;

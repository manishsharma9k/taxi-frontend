import RideForm from '../components/RideForm';
import { ShieldCheck, Zap, Clock, Star, MapPin, Smartphone, ChevronRight } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Daily Commuter, Delhi', text: 'TaxiNova has completely changed my daily commute. The bike taxis are always on time and the fares are super affordable!', stars: 5 },
  { name: 'Rahul Verma', role: 'IT Professional, Bangalore', text: 'I use TaxiNova every single day to beat Bangalore traffic. The captains are professional and the app is very smooth.', stars: 5 },
  { name: 'Anjali Singh', role: 'Student, Lucknow', text: 'Best ride-sharing app in India! The auto rides are haggle-free and I always know the exact fare before booking.', stars: 5 },
];

const FEATURES = [
  { icon: <ShieldCheck size={20} />, title: 'Insured Every Ride', desc: 'Every ride comes with accidental insurance coverage for complete peace of mind.' },
  { icon: <Zap size={20} />, title: 'Fastest Pickups', desc: 'With 1M+ captains across India, your ride arrives in under 3 minutes.' },
  { icon: <Clock size={20} />, title: '24/7 Availability', desc: 'Book a ride anytime — early morning, late night, we are always there for you.' },
  { icon: <MapPin size={20} />, title: 'Live Tracking', desc: 'Track your captain in real-time and share your trip with family for safety.' },
];

const LandingPage = () => {
  useScrollReveal();
  const scrollToForm = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Search pickup location..."]');
      if (input) input.focus();
    }, 500);
  };

  return (
    <div className="landing-page">

      {/* ── HERO ── */}
      <section className="hero-section">
        {/* Video Background */}
        <video
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          src="/riding.mp4"
        />
        <div className="hero-video-overlay" />
        <div className="container">
          <div className="hero-grid">

            {/* Left */}
            <div className="animate-fade-in-up" style={{ animationFillMode: 'both' }}>
              <div className="hero-badge">
                <Star size={12} fill="currentColor" /> India's #1 Bike Taxi App
              </div>

              <h1 className="title">
                Your ride,<br />
                <span className="text-primary">your way.</span>
              </h1>

              <p className="subtitle" style={{ marginTop: '1.25rem' }}>
                Book a bike, auto, or cab in seconds. Affordable fares, verified captains, and real-time tracking — all in one app.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }} onClick={scrollToForm}>
                  Book a Ride <ChevronRight size={16} />
                </button>
                <a href="/drive" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                  Become a Captain
                </a>
              </div>

              <div className="hero-stats">
                <div className="stat-pop reveal-d1">
                  <div className="hero-stat-value">10M+</div>
                  <div className="hero-stat-label">Happy Riders</div>
                </div>
                <div className="stat-pop reveal-d2">
                  <div className="hero-stat-value">1M+</div>
                  <div className="hero-stat-label">Captains</div>
                </div>
                <div className="stat-pop reveal-d3">
                  <div className="hero-stat-value">100+</div>
                  <div className="hero-stat-label">Cities</div>
                </div>
              </div>
            </div>

            {/* Right — Ride Form */}
            <div className="animate-fade-in-up delay-200" style={{ animationFillMode: 'both' }}>
              <RideForm />
            </div>

          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="services-section">
        <div className="container">
          <div style={{ textAlign: 'center' }} className="reveal">
            <p className="section-label">Our Services</p>
            <h2 className="section-title">Choose your <span className="text-primary">ride</span></h2>
            <p style={{ color: 'var(--text-2)', marginTop: '0.75rem', fontSize: '0.95rem' }}>
              From quick bike rides to comfortable cabs — we have got you covered.
            </p>
          </div>

          <div className="services-grid">
            {[
              { img: '/images/bike_taxi.png', icon: '🏍️', name: 'Bike Taxi', desc: 'Beat the traffic with our lightning-fast bike taxis. Perfect for solo commutes.', price: 'Starting ₹15', label: 'Book Bike' },
              { img: '/images/auto_rickshaw.png', icon: '🛺', name: 'Auto', desc: 'Haggle-free auto rides at standardized fares. Comfortable for short trips.', price: 'Starting ₹25', label: 'Book Auto' },
              { img: '/images/cab_ride.png', icon: '🚗', name: 'Cab', desc: 'AC cabs for comfortable journeys. Ideal for families and longer distances.', price: 'Starting ₹50', label: 'Book Cab' },
            ].map((s, i) => (
              <div key={s.name} className={`service-card reveal reveal-d${i + 1}`} onClick={scrollToForm}>
                <img src={s.img} alt={s.name} className="service-img" />
                <div className="service-icon-wrap">{s.icon}</div>
                <h3 className="service-name">{s.name}</h3>
                <p className="service-desc">{s.desc}</p>
                <p className="service-price">{s.price}</p>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {s.label} <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="reveal-left">
              <p className="section-label">Why TaxiNova</p>
              <h2 className="section-title">
                Ride smarter,<br />
                <span className="text-primary">ride safer.</span>
              </h2>
              <p style={{ color: 'var(--text-2)', margin: '1rem 0 2.5rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
                We are not just a ride-hailing app. We are your daily commute partner — built with safety, speed, and affordability at the core.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {FEATURES.map((f, i) => (
                  <div key={f.title} className={`feature-item reveal reveal-d${i + 1}`}>
                    <div className="feature-icon">{f.icon}</div>
                    <div>
                      <h4 className="feature-title">{f.title}</h4>
                      <p className="feature-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="reveal-right" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="float-anim" style={{ position: 'relative', width: '280px' }}>
                {/* Phone mockup */}
                <div style={{ background: 'linear-gradient(145deg, #1E1E1E, #141414)', border: '2px solid var(--border-light)', borderRadius: '36px', padding: '2rem 1.5rem', boxShadow: '0 40px 80px rgba(0,0,0,0.5), var(--shadow-yellow)' }}>
                  <div style={{ background: 'var(--primary)', borderRadius: '24px', padding: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}>
                    <Smartphone size={48} color="#0D0D0D" />
                    <p style={{ color: '#0D0D0D', fontWeight: '800', fontSize: '1rem', marginTop: '0.75rem' }}>TaxiNova App</p>
                    <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Available on iOS & Android</p>
                  </div>
                  {['Ride booked! 🏍️', 'Captain arriving in 2 min', 'OTP: 4821'].map((msg, i) => (
                    <div key={i} style={{ background: 'var(--bg-3)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                      {msg}
                    </div>
                  ))}
                </div>
                {/* Glow */}
                <div style={{ position: 'absolute', inset: '-20px', background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }} className="reveal">
            <p className="section-label">Testimonials</p>
            <h2 className="section-title">Loved by <span className="text-primary">millions</span></h2>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`testimonial-card reveal reveal-d${i + 1}`}>
                <div className="testimonial-stars">{'★'.repeat(t.stars)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD ── */}
      <section className="app-section">
        <div className="container">
          <div className="app-card reveal-scale">
            <div>
              <p className="section-label">Download App</p>
              <h2 className="section-title" style={{ maxWidth: '400px' }}>
                Get the <span className="text-primary">TaxiNova</span> app today
              </h2>
              <p style={{ color: 'var(--text-2)', marginTop: '0.75rem', fontSize: '0.95rem', maxWidth: '380px' }}>
                Book rides, track your captain, and manage payments — all from your phone.
              </p>
              <div className="app-store-btns">
                <a href="#" className="store-btn">
                  <span style={{ fontSize: '1.5rem' }}>▶</span>
                  <div>
                    <div className="store-btn-label">GET IT ON</div>
                    <div className="store-btn-name">Google Play</div>
                  </div>
                </a>
                <a href="#" className="store-btn">
                  <span style={{ fontSize: '1.5rem' }}>🍎</span>
                  <div>
                    <div className="store-btn-label">DOWNLOAD ON THE</div>
                    <div className="store-btn-name">App Store</div>
                  </div>
                </a>
              </div>
            </div>
            <div style={{ fontSize: '8rem', lineHeight: 1, opacity: 0.15, userSelect: 'none' }}>🏍️</div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

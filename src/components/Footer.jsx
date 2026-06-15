import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">

        {/* Brand */}
        <div>
          <style>{`
            .footer-logo-wrap { position:relative; display:flex; align-items:center; justify-content:center; width:48px; height:48px; }
            .footer-logo-ring { position:absolute; inset:-3px; border-radius:50%; background:conic-gradient(from 0deg,#F59E0B,#EF4444,#8B5CF6,#3B82F6,#F59E0B); animation:fRingRotate 3s linear infinite; mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 3px)); -webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 3px)); }
            @keyframes fRingRotate { to { transform:rotate(360deg); } }
            .footer-logo-img { animation:fLogoPulse 3s ease-in-out infinite; border-radius:50%; position:relative; z-index:1; }
            @keyframes fLogoPulse { 0%,100%{filter:drop-shadow(0 0 5px rgba(249,201,53,0.4))} 50%{filter:drop-shadow(0 0 16px rgba(249,201,53,0.85))} }
            .footer-logo-text { position:relative; overflow:hidden; }
            .footer-logo-shimmer { position:absolute; top:0; left:-60%; width:40%; height:100%; background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,0.55) 50%,transparent 100%); animation:fShimmer 3s ease-in-out infinite; pointer-events:none; }
            @keyframes fShimmer { 0%{left:-60%;opacity:0} 20%{opacity:1} 60%{left:120%;opacity:1} 61%,100%{opacity:0} }
            .footer-logo-link:hover .footer-logo-img { filter:drop-shadow(0 0 20px rgba(249,201,53,1)); }
            .footer-logo-link:hover .footer-logo-ring { animation-duration:1s; }
            .footer-logo-link:hover { transform:scale(1.06); transition:transform 0.25s ease; }
          `}</style>
          <Link to="/" className="footer-logo-link" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'10px' }}>
            <div className="footer-logo-wrap">
              <div className="footer-logo-ring" />
              <img src="/images/taxinova_logo.png" alt="TaxiNova Logi" className="footer-logo-img" style={{ height:'40px', width:'40px', objectFit:'contain' }} />
            </div>
            <span className="footer-logo-text" style={{ fontSize:'1.2rem', fontWeight:'900', color:'var(--text)', letterSpacing:'-0.02em' }}>
              Taxi<span style={{ color:'#F59E0B' }}>Nova</span>
              <span className="footer-logo-shimmer" />
            </span>
          </Link>
          <p className="footer-brand-desc">
            India's fastest-growing ride-hailing platform. Affordable, safe, and reliable rides across 100+ cities.
          </p>
          <div className="social-links">
            {['Fb', 'Tw', 'Ig', 'In'].map(s => (
              <a key={s} href="#" className="social-btn">{s}</a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><Link to="/about" className="footer-link">About Us</Link></li>
            <li><Link to="/careers" className="footer-link">Careers</Link></li>
            <li><Link to="/blog" className="footer-link">Blog</Link></li>
            <li><Link to="/press" className="footer-link">Press</Link></li>
          </ul>
        </div>

        {/* Riders */}
        <div>
          <h4 className="footer-heading">Riders</h4>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link">Book a Ride</Link></li>
            <li><Link to="/safety" className="footer-link">Safety</Link></li>
            <li><Link to="/corporate" className="footer-link">Corporate</Link></li>
            <li><Link to="/contact" className="footer-link">Support</Link></li>
          </ul>
        </div>

        {/* Captains */}
        <div>
          <h4 className="footer-heading">Captains</h4>
          <ul className="footer-links">
            <li><Link to="/drive" className="footer-link">Drive with Us</Link></li>
            <li><Link to="/captain-login" className="footer-link">Captain Login</Link></li>
            <li><Link to="/safety" className="footer-link">Captain Safety</Link></li>
            <li><Link to="/contact" className="footer-link">Help Center</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© {new Date().getFullYear()} TaxiNova Technologies Pvt. Ltd. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(l => (
            <Link key={l} to="/" className="footer-link" style={{ fontSize: '0.8rem' }}>{l}</Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

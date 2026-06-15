import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User as UserIcon, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuLinks, setMenuLinks] = useState([
    { label: 'Ride', path: '/', visible: true },
    { label: 'Drive', path: '/drive', visible: true },
    { label: 'About', path: '/about', visible: true },
    { label: 'Contact', path: '/contact', visible: true },
  ]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/header-links');
        if (!res.ok) throw new Error('Header links fetch failed');
        const data = await res.json();
        const visibleLinks = data.filter((link) => link.visible !== false);
        const normalizedLinks = visibleLinks.map((link) => ({
          ...link,
          path: link.path?.startsWith('/') ? link.path : `/${link.path}`,
        }));
        normalizedLinks.sort((a, b) => (a.order || 0) - (b.order || 0));
        setMenuLinks(normalizedLinks);
      } catch (err) {
        console.warn('Navbar header link load failed:', err.message);
      }
    };
    fetchLinks();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  // Hide navbar on admin/captain dashboard pages
  const hiddenRoutes = ['/dashboard', '/captain-dashboard', '/captain-panel'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <nav className="navbar" style={{
      background: scrolled
        ? theme === 'dark' ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.97)'
        : theme === 'dark' ? 'rgba(10, 22, 40, 0.93)' : 'rgba(245, 243, 255, 0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: 'none',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
      transition: 'background 0.4s ease, box-shadow 0.4s ease',
    }}>
      <div className="container nav-container">
        {/* Logo */}
        <Link to="/" className="logo" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div className="logo-icon-wrap">
            <div className="logo-ring" />
            <img
              src="/images/taxinova_logo.png"
              alt="TaxiNova Logi"
              className="logo-img"
              style={{ height: '38px', width: '38px', objectFit: 'contain', position: 'relative', zIndex: 1 }}
            />
          </div>          <span className="logo-text" style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'var(--text)', position: 'relative' }}>
            Taxi<span className="logo-nova">Nova</span>
            <span className="logo-shimmer" />
          </span>        </Link>

        {/* Desktop Nav */}
        <div className="nav-links" style={{ display: 'flex' }}>
          {menuLinks.map((link) => {
            const safePath = link.path?.startsWith('/') ? link.path : `/${link.path}`;
            return (
              <Link
                key={link._id || link.label}
                to={safePath}
                className={`nav-link${isActive(safePath) ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="btn btn-ghost"
            style={{ padding: '0.4rem 0.6rem', marginLeft: '0.25rem' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'var(--bg-3)', borderRadius: '100px', border: '1px solid var(--border)' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={13} color="#0D0D0D" />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text)' }}>{user.name?.split(' ')[0]}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '0.4rem 0.6rem' }} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <Link to="/login" className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Log in</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Sign up</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="btn btn-ghost"
          style={{ display: 'none', padding: '0.4rem' }}
          onClick={() => setMenuOpen(o => !o)}
          id="mobile-menu-btn"
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuLinks.map((link) => {
            const safePath = link.path?.startsWith('/') ? link.path : `/${link.path}`;
            return (
              <Link key={link._id || link.label} to={safePath} className="nav-link">
                {link.label}
              </Link>
            );
          })}

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start', gap: '0.6rem', padding: '0.5rem 0', marginTop: '0.25rem' }}
          >
            {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>

          {user ? (
            <button onClick={handleLogout} className="btn btn-outline" style={{ marginTop: '0.25rem', justifyContent: 'flex-start' }}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ flex: 1 }}>Log in</Link>
              <Link to="/signup" className="btn btn-primary" style={{ flex: 1 }}>Sign up</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
        .logo { animation: logoFadeIn 0.6s ease forwards; }
        @keyframes logoFadeIn {
          from { opacity: 0; transform: translateX(-14px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* icon wrapper */
        .logo-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
        }

        /* spinning gradient ring */
        .logo-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #F59E0B, #EF4444, #8B5CF6, #3B82F6, #F59E0B);
          animation: ringRotate 3s linear infinite;
          mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
        }
        @keyframes ringRotate { to { transform: rotate(360deg); } }

        /* logo image glow pulse */
        .logo-img {
          animation: logoPulse 3s ease-in-out infinite;
          border-radius: 50%;
        }
        @keyframes logoPulse {
          0%,100% { filter: drop-shadow(0 0 5px rgba(249,201,53,0.4)); }
          50%      { filter: drop-shadow(0 0 16px rgba(249,201,53,0.85)); }
        }

        /* text shimmer sweep */
        .logo-text { overflow: hidden; }
        .logo-nova  { color: #F59E0B; }
        .logo-shimmer {
          position: absolute;
          top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
          animation: shimmerSweep 3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes shimmerSweep {
          0%   { left: -60%; opacity: 0; }
          20%  { opacity: 1; }
          60%  { left: 120%; opacity: 1; }
          61%,100% { opacity: 0; }
        }

        /* hover: scale + extra glow */
        .logo:hover .logo-img  { filter: drop-shadow(0 0 20px rgba(249,201,53,1)); }
        .logo:hover .logo-ring { animation-duration: 1s; }
        .logo:hover            { transform: scale(1.06); transition: transform 0.25s ease; }
      `}</style>
    </nav>
  );
};

export default Navbar;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AboutPage from './pages/AboutPage';
import DrivePage from './pages/DrivePage';
import ContactPage from './pages/ContactPage';
import CaptainDashboard from './pages/CaptainDashboard';
import CaptainDashboardLayout from './components/CaptainDashboardLayout';
import StaticPage from './pages/StaticPage';
import BlogPage from './pages/BlogPage';
import CareersPage from './pages/CareersPage';
import PressPage from './pages/PressPage';
import DynamicPage from './pages/DynamicPage';
import UserProfile from './pages/UserProfile';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import DashboardLayout from './components/DashboardLayout';
import AdminLogin from './pages/AdminLogin';
import CaptainLogin from './pages/CaptainLogin';

function App() {
  return (
    <AuthProvider>
        <Router>
          <Routes>
            {/* Full-screen panels — no Navbar/Footer */}
            <Route path="/dashboard" element={<DashboardLayout />} />
            <Route path="/captain-panel" element={<CaptainDashboardLayout />} />

            {/* Normal pages — with Navbar & Footer */}
            <Route path="/*" element={
              <div className="app-wrapper">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/drive" element={<DrivePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/captain-login" element={<CaptainLogin />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/captain-dashboard" element={<CaptainDashboard />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/press" element={<PressPage />} />
                    <Route path="/safety" element={<StaticPage title="Safety is our Priority" content={<p>We ensure every ride is tracked, every captain is verified, and our 24/7 support team is always ready to assist you. Ride with confidence.</p>} />} />
                    <Route path="/corporate" element={<StaticPage title="Corporate Solutions" content={<p>Simplify your team's commute. TaxiNova Corporate offers specialized billing, dedicated support, and bulk ride management for modern businesses.</p>} />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="*" element={<DynamicPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;

import { Users, Map, TrendingUp } from 'lucide-react';
import { usePageContent } from '../hooks/usePageContent';

const AboutPage = () => {
  const { pageContent } = usePageContent('/about');

  return (
    <div className="about-page" style={{ paddingTop: '6rem', minHeight: '80vh' }}>
      
      {/* Hero Section */}
      <section style={{
        padding: '5rem 0',
        background: 'linear-gradient(135deg, #0f2557 0%, #1a3a6e 40%, #0e4d6e 70%, #0a2d4a 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container animate-fade-in-up" style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ display: 'inline-block', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.35)', color: '#7DD3FC', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.9rem', borderRadius: '100px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Our Story</span>
          <h1 className="title" style={{ color: '#F0F9FF', letterSpacing: '-0.03em' }}>Know Us Better</h1>
          <p className="subtitle" style={{ color: '#BAE6FD', margin: '1.5rem auto', fontWeight: '400', maxWidth: '560px' }}>
            India's first and fastest-growing super app tailored for affordable and quick mobility solutions.
            Reshaping intra-city travel through technology and passion.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[['100+', 'Cities'], ['10M+', 'Rides'], ['50K+', 'Captains']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#38BDF8', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.78rem', color: '#7DD3FC', marginTop: '0.3rem', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {pageContent && (
        <section style={{ padding: '4rem 0', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '980px' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
                {pageContent.title}
              </h2>
              <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: pageContent.content }} />
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container features-grid">
          
          <div className="glass-panel" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)' }}>Our Vision</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              To ensure that everyday commuting is not a struggle but a seamless, accessible and pleasant daily activity for millions of commuters across the nation. By prioritizing affordable micro-mobility, we envision a future without massive traffic bottlenecks.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)' }}>What We Do</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              TaxiNova brings you safe, convenient, and cost-effective daily travel. Our unique platform allows Captains (drivers) to share their rides with commuters looking for a quick and reliable alternative to traditional transport modalities like overcrowded buses and expensive cabs.
            </p>
          </div>

        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 0', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
           <h2 style={{ fontSize: '2.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '3rem' }}>
             The <span className="text-primary">TaxiNova</span> Impact
           </h2>
           
           <div className="services-grid" style={{ textAlign: 'center' }}>
             <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Users size={48} color="var(--primary)" /></div>
               <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text)' }}>25M+</h3>
               <p style={{ color: 'var(--text-2)' }}>App Downloads</p>
             </div>
             <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Map size={48} color="var(--primary)" /></div>
               <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text)' }}>100+</h3>
               <p style={{ color: 'var(--text-2)' }}>Cities across India</p>
             </div>
             <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><TrendingUp size={48} color="var(--primary)" /></div>
               <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text)' }}>10M+</h3>
               <p style={{ color: 'var(--text-2)' }}>Safe Rides Completed</p>
             </div>
           </div>
        </div>
      </section>
      
    </div>
  );
};

export default AboutPage;

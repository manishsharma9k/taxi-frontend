import { MapPin, Briefcase, Clock } from 'lucide-react';
import { usePageContent } from '../hooks/usePageContent';

const roles = [
  { title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Bengaluru / Remote', type: 'Full-time' },
  { title: 'iOS & Android Developer', dept: 'Engineering', location: 'Hyderabad / Remote', type: 'Full-time' },
  { title: 'Data Scientist – Pricing & Demand', dept: 'Data & AI', location: 'Bengaluru', type: 'Full-time' },
  { title: 'City Operations Manager', dept: 'Operations', location: 'Lucknow / Delhi / Mumbai', type: 'Full-time' },
  { title: 'Growth Marketing Manager', dept: 'Marketing', location: 'Bengaluru', type: 'Full-time' },
  { title: 'Product Manager – Rider Experience', dept: 'Product', location: 'Bengaluru / Remote', type: 'Full-time' },
  { title: 'UX / UI Designer', dept: 'Design', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Support Lead', dept: 'Support', location: 'Noida', type: 'Full-time' },
];

const perks = [
  { icon: '💰', title: 'Competitive Pay', desc: 'Market-leading salaries + ESOPs for every full-time employee.' },
  { icon: '🏥', title: 'Health Coverage', desc: 'Comprehensive medical, dental & vision for you and your family.' },
  { icon: '🌍', title: 'Remote Friendly', desc: 'Flexible work-from-home options across most roles.' },
  { icon: '📚', title: 'Learning Budget', desc: '₹50,000/year for courses, conferences, and certifications.' },
  { icon: '🚀', title: 'Fast Growth', desc: 'Work on problems that impact millions of users every day.' },
  { icon: '🎉', title: 'Team Culture', desc: 'Regular offsites, hackathons, and a team that celebrates wins.' },
];

const CareersPage = () => {
  const { pageContent, loadingPageContent } = usePageContent('/careers');

  if (loadingPageContent) {
    return <div style={{ paddingTop: '8rem', minHeight: '80vh', textAlign: 'center' }}>Loading...</div>;
  }

  if (pageContent) {
    return (
      <div style={{ paddingTop: '6rem', minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="container" style={{ maxWidth: '900px', padding: '3rem 1.5rem' }}>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--text)' }}>{pageContent.title}</h1>
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: pageContent.content }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '6rem', minHeight: '100vh', background: 'var(--bg)' }}>
    {/* Hero */}
    <div style={{ background: 'linear-gradient(135deg, #1a1a00 0%, var(--bg-2) 100%)', borderBottom: '1px solid var(--border)', padding: '4rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <span style={{ background: 'var(--primary)', color: '#000', fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '100px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>We're Hiring</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', marginTop: '1rem', marginBottom: '1rem', color: 'var(--text)', lineHeight: 1.1 }}>
          Build the Future of<br />Urban Mobility
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '560px', marginBottom: '2rem' }}>
          Join a team of 1,000+ passionate people solving real problems for millions of riders and captains across India.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['1,000+ Team Members', '100+ Cities', '4.8★ Glassdoor'].map(s => (
            <div key={s} style={{ background: 'rgba(249,201,53,0.12)', border: '1px solid rgba(249,201,53,0.25)', borderRadius: '100px', padding: '0.4rem 1rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>{s}</div>
          ))}
        </div>
      </div>
    </div>

    <div className="container" style={{ maxWidth: '1000px', padding: '3rem 1.5rem' }}>
      {/* Perks */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1.5rem' }}>Why TaxiNova?</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {perks.map((p, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.75rem' }}>{p.icon}</span>
            <div>
              <h4 style={{ fontWeight: '700', color: 'var(--text)', marginBottom: '0.25rem' }}>{p.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Open Roles */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1.5rem' }}>Open Positions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {roles.map((r, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', cursor: 'pointer', transition: 'border-color 0.2s', border: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div>
              <h3 style={{ fontWeight: '700', color: 'var(--text)', fontSize: '1rem', marginBottom: '0.35rem' }}>{r.title}</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}><Briefcase size={12} />{r.dept}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}><MapPin size={12} />{r.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}><Clock size={12} />{r.type}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '10px', fontWeight: '700', whiteSpace: 'nowrap' }}>Apply Now</button>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="glass-panel" style={{ marginTop: '2.5rem', padding: '2.5rem', borderRadius: '20px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(249,201,53,0.08) 0%, var(--bg-2) 100%)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Don't see your role?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>We're always looking for great talent. Send us your resume and we'll reach out when the right opportunity opens up.</p>
        <a href="mailto:careers@taxinova.in" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem', textDecoration: 'none' }}>Send Your Resume</a>
      </div>
    </div>
  </div>
)}

export default CareersPage;

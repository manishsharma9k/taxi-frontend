import { Download, Mail, ExternalLink } from 'lucide-react';
import { usePageContent } from '../hooks/usePageContent';

const coverage = [
  { outlet: 'Economic Times', date: 'June 2025', headline: 'TaxiNova crosses 10 million rides, eyes Series B funding', logo: 'ET' },
  { outlet: 'YourStory', date: 'May 2025', headline: 'How TaxiNova is disrupting ride-hailing in Tier-2 cities', logo: 'YS' },
  { outlet: 'Inc42', date: 'April 2025', headline: 'TaxiNova raises Rs.120 Cr in Series A led by Tiger Global', logo: 'I42' },
  { outlet: 'TechCrunch India', date: 'March 2025', headline: "TaxiNova's AI dispatch engine cuts wait times by 40%", logo: 'TC' },
  { outlet: 'Business Standard', date: 'February 2025', headline: 'TaxiNova partners with 3 state governments for last-mile connectivity', logo: 'BS' },
  { outlet: 'Mint', date: 'January 2025', headline: "Startup of the Year: TaxiNova's rapid rise in urban mobility", logo: 'M' },
];

const stats = [
  { value: '10M+', label: 'Rides Completed' },
  { value: '100+', label: 'Cities' },
  { value: '50K+', label: 'Active Captains' },
  { value: '4.8 / 5', label: 'Average Rating' },
];

const kitItems = [
  { icon: '[IMG]', title: 'Brand Assets', desc: 'Logos, color palette, typography guidelines, and usage rules.' },
  { icon: '[DOC]', title: 'Fact Sheet', desc: 'Key company stats, milestones, and leadership bios.' },
  { icon: '[MIC]', title: 'Press Releases', desc: 'All official announcements and product launch statements.' },
];

const PressPage = () => {
  const { pageContent, loadingPageContent } = usePageContent('/press');

  if (loadingPageContent) {
    return <div style={{ paddingTop: '8rem', minHeight: '80vh', textAlign: 'center' }}>Loading...</div>;
  }

  const renderCoverage = coverage.map((item, index) => (
    <div key={index} className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(249,201,53,0.15)', border: '1px solid rgba(249,201,53,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.7rem', color: 'var(--primary)', flexShrink: 0 }}>{item.logo}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.85rem' }}>{item.outlet}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{item.date}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>{item.headline}</p>
      </div>
      <ExternalLink size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </div>
  ));

  const renderKitItems = kitItems.map((kit, index) => (
    <div key={index} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'rgba(249,201,53,0.15)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>{kit.icon}</span>
      <h3 style={{ fontWeight: '700', color: 'var(--text)', margin: '0.75rem 0 0.4rem' }}>{kit.title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>{kit.desc}</p>
      <button className="btn btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Download size={13} /> Download
      </button>
    </div>
  ));

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
      <div style={{ background: 'linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%)', borderBottom: '1px solid var(--border)', padding: '4rem 0 3rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <span style={{ background: 'var(--primary)', color: '#000', fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '100px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Newsroom</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', marginTop: '1rem', marginBottom: '1rem', color: 'var(--text)', lineHeight: 1.1 }}>
            TaxiNova in the News
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '560px', marginBottom: '2rem' }}>
            Official press releases, media coverage, and brand resources for journalists and media professionals.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a href="mailto:media@taxinova.in" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={15} /> Media Enquiry
            </a>
            <button className="btn btn-outline" style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={15} /> Press Kit
            </button>
          </div>
        </div>
      </div>
      <div className="container" style={{ maxWidth: '1000px', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {stats.map((item, index) => (
            <div key={index} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>{item.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>{item.label}</div>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1.5rem' }}>Media Coverage</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
          {renderCoverage}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {renderKitItems}
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '20px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(249,201,53,0.08) 0%, var(--bg-2) 100%)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Media Contact</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>For press inquiries, interview requests, or official statements:</p>
          <a href="mailto:media@taxinova.in" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.05rem', textDecoration: 'none' }}>media@taxinova.in</a>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>We typically respond within 24 hours on business days.</p>
        </div>
      </div>
    </div>
  );
};

export default PressPage;

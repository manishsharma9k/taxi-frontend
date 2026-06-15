import { Link } from 'react-router-dom';
import { usePageContent } from '../hooks/usePageContent';

const posts = [
  {
    tag: 'Product',
    date: 'June 10, 2025',
    title: 'TaxiNova Now Live in 100+ Cities Across India',
    desc: 'We started with a dream to make daily commutes affordable and safe. Today, we are proud to announce our expansion to over 100 cities, serving millions of riders every month.',
    img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80',
  },
  {
    tag: 'Safety',
    date: 'May 28, 2025',
    title: 'How TaxiNova is Redefining Ride Safety in India',
    desc: 'From real-time GPS tracking to SOS alerts and verified captains — here is a deep dive into the safety features that protect every TaxiNova ride.',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    tag: 'Community',
    date: 'May 15, 2025',
    title: 'Captain Stories: Meet Ramesh, Our Top-Rated Driver in Lucknow',
    desc: 'Ramesh has completed over 3,000 rides with a perfect 5-star rating. We sat down with him to learn what drives his passion for delivering great experiences.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  },
  {
    tag: 'Technology',
    date: 'April 30, 2025',
    title: 'Behind the Algorithm: How TaxiNova Matches You with the Nearest Captain',
    desc: 'Our smart dispatch engine processes thousands of requests per second. Here is how we built a system that gets you a ride in under 3 minutes.',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  },
  {
    tag: 'Sustainability',
    date: 'April 12, 2025',
    title: 'Going Green: TaxiNovas EV Fleet Initiative',
    desc: 'We are partnering with EV manufacturers to onboard 10,000 electric vehicles by 2026, reducing carbon emissions across our network.',
    img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80',
  },
  {
    tag: 'Business',
    date: 'March 25, 2025',
    title: 'TaxiNova Corporate: Simplifying Office Commutes for 500+ Companies',
    desc: 'Our corporate solution now powers daily commutes for employees at leading startups and enterprises. Here is what makes it different.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
  },
];

const BlogPage = () => {
  const { pageContent, loadingPageContent } = usePageContent('/blog');

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
    <div style={{ background: 'linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%)', borderBottom: '1px solid var(--border)', padding: '4rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <span style={{ background: 'var(--primary)', color: '#000', fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '100px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>TaxiNova Blog</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', marginTop: '1rem', marginBottom: '1rem', color: 'var(--text)', lineHeight: 1.1 }}>
          Stories, Updates &<br />Insights from TaxiNova
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '560px' }}>
          The latest news on our product, community, safety initiatives, and the people who make TaxiNova great.
        </p>
      </div>
    </div>

    {/* Posts Grid */}
    <div className="container" style={{ maxWidth: '1100px', padding: '3rem 1.5rem' }}>
      {/* Featured */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {posts.map((p, i) => (
          <div key={i} className="glass-panel" style={{ overflow: 'hidden', borderRadius: '16px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
          >
            <img src={p.img} alt={p.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ background: 'rgba(249,201,53,0.15)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.tag}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{p.date}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.4 }}>{p.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{p.desc}</p>
              <span style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>Read more →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div className="glass-panel" style={{ marginTop: '3rem', padding: '2.5rem', borderRadius: '20px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(249,201,53,0.08) 0%, var(--bg-2) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Stay in the Loop</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Get the latest TaxiNova stories delivered to your inbox.</p>
        <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '420px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input type="email" placeholder="Enter your email" style={{ flex: 1, minWidth: '200px', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }} />
          <button className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: '700' }}>Subscribe</button>
        </div>
      </div>
    </div>
  </div>
)}

export default BlogPage;

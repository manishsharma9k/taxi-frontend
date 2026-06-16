import React, { useState } from 'react';
import axios from 'axios';
import { Mail, User, BookOpen, MessageSquare, Send, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageContent } from '../hooks/usePageContent';
import { API_URL } from '../api.js';

const ContactPage = () => {
    const { pageContent } = usePageContent('/contact');
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', userType: 'customer' });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');
        try {
            await axios.post(`${API_URL}/api/contact/submit`, formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '', userType: 'customer' });
        } catch (error) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div className="container features-grid" style={{ flex: 1, paddingTop: '8rem', paddingBottom: '4rem' }}>

                {/* Left Side: Contact Form */}
                <div className="glass-panel animate-fade-in-up" style={{ padding: '3rem', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)', textAlign: 'center' }}>{pageContent?.title || 'Contact Us'}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>{pageContent?.content ? '' : "We'd love to hear from you. Send us a message."}</p>
                    {pageContent?.content && (
                      <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: pageContent.content }} />
                    )}

                    {status === 'success' && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>Message sent successfully! Our admin will review it soon.</div>}
                    {status === 'error' && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>Failed to send message. Please try again.</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Are you a Captain or Customer?</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select name="userType" className="input-field" value={formData.userType} onChange={handleChange} style={{ paddingLeft: '2.5rem', appearance: 'none', backgroundColor: 'transparent' }} required>
                                    <option value="customer" style={{ color: '#111' }}>--Select--</option>
                                    <option value="customer" style={{ color: '#111' }}>Customer</option>
                                    <option value="captain" style={{ color: '#111' }}>Captain</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" name="name" className="input-field" placeholder="Enter Your Name" value={formData.name} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="email" name="email" className="input-field" placeholder="your email address" value={formData.email} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Subject (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <BookOpen size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" name="subject" className="input-field" placeholder="Inquiry about ride" value={formData.subject} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Message</label>
                            <div style={{ position: 'relative' }}>
                                <MessageSquare size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)' }} />
                                <textarea name="message" className="input-field" placeholder="How can we help you?" value={formData.message} onChange={handleChange} style={{ paddingLeft: '2.5rem', minHeight: '120px', resize: 'vertical', paddingTop: '1rem' }} required></textarea>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '1.05rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
                            {loading ? 'Sending...' : <>Send Message <Send size={18} /></>}
                        </button>
                    </form>
                </div>

                {/* Right Side: Office Locations */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>Our <span className="text-primary">Offices</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Visit us at any of our registered offices across India.</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(249, 201, 53, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                            <MapPin size={28} color="var(--primary)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Mumbai Headquarters</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>TaxiNova Tech Pvt. Ltd.<br />Level 4, Cyber City IT Park,<br />Andheri East, Mumbai, 400053<br />Maharashtra, India</p>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(249, 201, 53, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                            <MapPin size={28} color="var(--primary)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Delhi NCR Office</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>TaxiNova Operations Hub<br />Block C, Sector 16,<br />Noida, 201301<br />Uttar Pradesh, India</p>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(249, 201, 53, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                            <MapPin size={28} color="var(--primary)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Bangalore Tech Park</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>TaxiNova Innovation Lab<br />Ground Floor, Electronic City Phase 1,<br />Bangalore, 560100<br />Karnataka, India</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
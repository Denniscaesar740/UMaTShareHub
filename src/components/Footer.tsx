import React from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Twitter,
    Facebook
} from 'lucide-react';
import UmatLogo from '../assets/Umatlogo.png';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{ background: 'var(--bg-card)', padding: '100px 20px 40px 20px', borderTop: '1px solid var(--glass-border)' }}>
            <div className="main-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', marginBottom: '80px' }}>
                    {/* Brand Info */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
                            <img
                                src={UmatLogo}
                                alt="UMAT Logo"
                                style={{ width: '40px', height: 'auto' }}
                            />
                            <h2 className="playfair" style={{ fontSize: '1.5rem', margin: 0 }}>UMAT <span style={{ color: 'var(--umat-gold)' }}>ShareHub</span></h2>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '350px', lineHeight: 1.8 }}>
                            Ensuring the integrity, security, and accessibility of institutional documents for the University of Mines and Technology Academic Board.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                            {[Linkedin, Twitter, Facebook].map((Icon, i) => (
                                <a key={i} href="#" className="glass-card" style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--text-muted)', transition: 'all 0.3s ease' }}>
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Platform</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {['Features', 'Security', 'Roadmap', 'Pricing'].map(link => (
                                <a key={link} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }}>
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Institutional</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {['Academic Board', 'Registry', 'Library', 'IT Services'].map(link => (
                                <a key={link} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Contact IT Desk</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Mail size={18} color="var(--umat-gold)" />
                                it.support@umat.edu.gh
                            </div>
                            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Phone size={18} color="var(--umat-gold)" />
                                +233 (0) 3123 20324
                            </div>
                            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <MapPin size={18} color="var(--umat-gold)" />
                                Tarkwa - Western Region, Ghana
                            </div>
                        </div>
                    </div>
                </div >

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        &copy; {currentYear} University of Mines and Technology. All Rights Reserved.
                    </p>
                    <div style={{ display: 'flex', gap: '32px' }}>
                        <a href="#" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
                        <a href="#" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Security Audit</a>
                    </div>
                </div>
            </div >
        </footer >
    );
};

export default Footer;

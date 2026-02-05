import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import FeaturesGrid from './FeaturesGrid';
import BenefitsSection from './BenefitsSection';
import HowItWorks from './HowItWorks';
import SupportSection from './SupportSection';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import LandIcon from '../assets/landicon.jpg';

interface LandingPageProps {
    onEnterPortal: () => void;
    onLoginClick: () => void;
    onRegisterClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal, onLoginClick, onRegisterClick }) => {
    const { t } = useLanguage();
    const heroImage = LandIcon;

    return (
        <div className="landing-page">
            <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />

            <Hero
                onGetStarted={onEnterPortal}
                imageSrc={heroImage}
            />

            <FeaturesGrid />

            {/* Premium Stats Bar */}
            <section style={{ padding: '60px 20px', background: 'var(--umat-green)', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Pattern Overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(var(--umat-gold) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="main-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    {[
                        { label: t('stats.boards'), value: '150+' },
                        { label: t('stats.papers'), value: '4.2k' },
                        { label: t('stats.security'), value: 'A+' },
                        { label: t('stats.availability'), value: '24/7' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <h2 className="playfair" style={{ fontSize: '3.5rem', margin: 0, color: 'var(--umat-gold)', fontWeight: 800 }}>{stat.value}</h2>
                            <p className="mono" style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.8rem', marginTop: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <BenefitsSection />

            {/* Mission Statement Section */}
            <section style={{ padding: '80px 20px', background: 'var(--bg-dark)' }}>
                <div className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'center' }}>
                    <div className="glass-card" style={{ padding: '60px', borderRadius: '40px', background: 'linear-gradient(135deg, rgba(0, 104, 55, 0.05) 0%, transparent 100%)' }}>
                        <div className="mono" style={{ color: 'var(--umat-gold)', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 800 }}>THE MISSION</div>
                        <h2 className="playfair" style={{ fontSize: '3rem', lineHeight: 1.2, marginBottom: '24px' }}>Preserving the Integrity of Academic Discourse.</h2>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                            Our portal serves as the digital backbone of the University of Mines and Technology's governance, ensuring that every decision, policy, and research document is preserved with military-grade security.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {[
                            { title: 'Transparency', desc: 'Full audit logs for every interaction.', icon: <Shield size={24} /> },
                            { title: 'Efficiency', desc: 'Sync minutes in seconds across units.', icon: <Star size={24} /> },
                            { title: 'Continuity', desc: 'Decades of archives at your fingertips.', icon: <Users size={24} /> },
                            { title: 'Innovation', desc: 'The first of its kind in Ghana.', icon: <ArrowRight size={24} /> },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className="glass-card"
                                style={{ padding: '32px' }}
                            >
                                <div style={{ color: 'var(--umat-gold)', marginBottom: '16px' }}>{item.icon}</div>
                                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{item.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <HowItWorks />

            <SupportSection />

            {/* Dynamic CTA */}
            <section style={{ padding: '60px 20px' }}>
                <div className="main-content">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{
                            padding: '100px 60px',
                            textAlign: 'center',
                            background: 'linear-gradient(225deg, var(--umat-navy) 0%, var(--umat-green) 100%)',
                            border: 'none',
                            borderRadius: '48px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 50px 100px -20px rgba(0, 45, 98, 0.4)'
                        }}
                    >
                        {/* Decorative Blobs inside CTA */}
                        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'var(--umat-gold)', filter: 'blur(100px)', opacity: 0.1 }}></div>
                        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'var(--umat-green-light)', filter: 'blur(100px)', opacity: 0.2 }}></div>

                        <div className="mono" style={{ color: 'var(--umat-gold)', marginBottom: '32px', fontSize: '1rem', fontWeight: 800, letterSpacing: '4px' }}>SECURE ACCESS ONLY</div>
                        <h2 className="playfair" style={{ fontSize: '4rem', marginBottom: '32px', color: 'white', lineHeight: 1.1 }}>Elevate Your Academic <br />Collaboration Today.</h2>

                        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                            <button
                                className="btn-primary"
                                onClick={onEnterPortal}
                                style={{
                                    padding: '24px 56px',
                                    fontSize: '1.2rem',
                                    borderRadius: '18px',
                                    background: 'var(--umat-gold)',
                                    color: 'var(--umat-navy)',
                                    boxShadow: '0 25px 50px -10px rgba(251, 191, 36, 0.5)',
                                    fontWeight: 900
                                }}
                            >
                                Get Started
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;

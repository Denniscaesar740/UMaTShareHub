import React from 'react';
import { motion } from 'framer-motion';
import { Mail, LifeBuoy, ArrowUpRight, HelpCircle } from 'lucide-react';

const SupportSection: React.FC = () => {
    const supportChannels = [
        {
            title: 'Technical Desk',
            desc: 'Direct line to our institutional IT command center for access issues.',
            icon: <LifeBuoy size={28} />,
            contact: '+233 (0) 3321 32456',
            action: 'Call Now',
            color: 'var(--umat-green)'
        },
        {
            title: 'Email Support',
            desc: 'Send us detailed inquiries or request for document restoration.',
            icon: <Mail size={28} />,
            contact: 'support@umat.edu.gh',
            action: 'Send Email',
            color: 'var(--umat-gold)'
        },
        {
            title: 'Knowledge Base',
            desc: 'Browse our comprehensive guides and board member tutorials.',
            icon: <HelpCircle size={28} />,
            contact: 'v1.0 Documentation',
            action: 'Read Guides',
            color: 'var(--umat-navy)'
        }
    ];

    return (
        <section id="support" style={{ padding: '100px 20px', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}>
            {/* Background Accent */}
            <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '600px', height: '600px', background: 'var(--umat-gold)', filter: 'blur(150px)', opacity: 0.03 }}></div>

            <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <div className="mono" style={{ color: 'var(--umat-gold)', fontSize: '0.96rem', marginBottom: '20px', fontWeight: 700, letterSpacing: '8px', textTransform: 'uppercase' }}>Reliability First</div>
                    <h2 className="playfair" style={{ fontSize: '3.5rem', marginBottom: '24px', lineHeight: 1.1 }}>Institutional <span className="text-gradient">Support</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>
                        Dedicated technical assistance for UMaT Board Members and Administrative Staff. We ensure your governance continuity.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                    {supportChannels.map((channel, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card shadow-hover"
                            style={{ padding: '48px', position: 'relative' }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '16px',
                                background: 'var(--bg-dark)',
                                border: '1px solid var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: channel.color,
                                marginBottom: '32px',
                                boxShadow: `0 10px 30px -10px ${channel.color}30`
                            }}>
                                {channel.icon}
                            </div>

                            <h3 className="playfair" style={{ fontSize: '1.75rem', marginBottom: '16px' }}>{channel.title}</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px', fontSize: '1rem' }}>{channel.desc}</p>

                            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>{channel.contact}</p>
                                <button className="btn-outline" style={{ borderStyle: 'dashed', borderRadius: '12px', width: '100%', justifyContent: 'center', gap: '12px' }}>
                                    {channel.action}
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Service Status */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    style={{
                        marginTop: '60px',
                        padding: '24px 40px',
                        background: 'rgba(0, 107, 63, 0.05)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        border: '1px solid rgba(0, 107, 63, 0.1)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--umat-green)', borderRadius: '50%', boxShadow: '0 0 10px var(--umat-green)' }}></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--umat-green)' }}>All Systems Operational</span>
                    </div>
                    <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }}></div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Average response time: &lt; 15 minutes</p>
                </motion.div>
            </div>
        </section>
    );
};

export default SupportSection;

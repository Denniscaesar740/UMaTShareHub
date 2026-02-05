import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            num: '01',
            title: 'Registry Verification',
            desc: 'Institutional identity is cross-referenced with the Registry databases.',
            color: 'var(--umat-green)'
        },
        {
            num: '02',
            title: 'MFA Safeguards',
            desc: 'Accounts are protected via multi-factor authentication protocols.',
            color: 'var(--umat-gold)'
        },
        {
            num: '03',
            title: 'Central Command',
            desc: 'Govern and share documents using the unified board interface.',
            color: 'var(--umat-navy)'
        },
        {
            num: '04',
            title: 'Governance Audit',
            desc: 'Every decision is logged and archived for institutional transparency.',
            color: 'var(--umat-copper)'
        }
    ];

    return (
        <section id="how-it-works" style={{ padding: '80px 20px', background: 'var(--bg-dark)', position: 'relative', borderTop: '1px solid var(--glass-border)' }}>
            <div className="main-content">
                <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                    <div className="mono" style={{ color: 'var(--umat-gold)', marginBottom: '24px', letterSpacing: '8px', fontWeight: 800 }}>THE PROTOCOL</div>
                    <h2 className="text-display">Institutional Flow.</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px', position: 'relative' }}>
                    {/* Connecting Line (Desktop) */}
                    <div className="connector-line"></div>

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
                        >
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '32px',
                                background: 'var(--bg-card)',
                                border: `2px solid ${step.color}`,
                                margin: '0 auto 40px auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: step.color,
                                fontSize: '2rem',
                                fontWeight: 900,
                                transform: 'rotate(45deg)',
                                boxShadow: `0 20px 40px ${step.color}15`
                            }}>
                                <div style={{ transform: 'rotate(-45deg)' }}>{step.num}</div>
                            </div>
                            <h3 className="playfair" style={{ fontSize: '1.75rem', marginBottom: '20px' }}>{step.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7 }}>{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
        .connector-line {
          position: absolute;
          top: 60px;
          left: 15%;
          right: 15%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--umat-gold), transparent);
          opacity: 0.1;
          display: none;
        }
        @media (min-width: 1024px) {
          .connector-line { display: block; }
        }
      `}</style>
        </section>
    );
};

export default HowItWorks;

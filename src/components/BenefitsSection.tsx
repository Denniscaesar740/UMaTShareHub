import React from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BenefitsSection: React.FC = () => {
    const comparison = [
        { feature: 'Searchability', whatsapp: 'Manual/Linear', sharehub: 'Semantic/Instant' },
        { feature: 'Institutional Security', whatsapp: 'Basic Encryption', sharehub: 'Board-Grade' },
        { feature: 'File Lifecycle', whatsapp: 'Fragile/Lost', sharehub: 'Versioned/Archived' },
        { feature: 'Access Control', whatsapp: 'Public to Group', sharehub: 'Role-Based' },
        { feature: 'Accountability', whatsapp: 'None', sharehub: 'Full Audit Trail' },
    ];

    return (
        <section id="about" style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
            <div className="main-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1.2fr', gap: '100px', alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="mono" style={{ color: 'var(--umat-gold)', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '4px' }}>THE IMPERATIVE</div>
                        <h2 className="text-display">A Better Way <br /><span className="text-gradient">to Govern.</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '48px', lineHeight: 1.6 }}>
                            Moving beyond fragmented communication. ShareHub is the centralized, secure authority for the UMaT Academic Board.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                'Centralized Institutional Repository',
                                'Semantic Search & Categorization',
                                'Governance Meeting Integration'
                            ].map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--umat-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(0, 104, 55, 0.4)' }}>
                                        <Check size={16} color="white" />
                                    </div>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>{benefit}</span>
                                </motion.div>
                            ))}
                        </div>

                        <button className="btn-outline" style={{ marginTop: '60px', padding: '16px 32px', borderRadius: '12px' }}>
                            Read Institutional Policy <ArrowRight size={18} style={{ marginLeft: '12px' }} />
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="glass-card"
                        style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.1)' }}
                    >
                        <div style={{ padding: '40px', background: 'linear-gradient(135deg, var(--umat-navy) 0%, var(--umat-green) 100%)', color: 'white' }}>
                            <h3 className="playfair" style={{ fontSize: '1.8rem', margin: 0 }}>Social Media vs. ShareHub</h3>
                            <p style={{ margin: '8px 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>Comparative Risk Assessment</p>
                        </div>
                        <div style={{ padding: '40px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--glass-border)' }}>
                                        <th style={{ padding: '20px 10px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Metric</th>
                                        <th style={{ padding: '20px 10px', color: '#ff4b4b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Legacy Ops</th>
                                        <th style={{ padding: '20px 10px', color: 'var(--umat-gold)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>ShareHub</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparison.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: i < comparison.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                            <td style={{ padding: '24px 10px', fontWeight: 600, fontSize: '1rem' }}>{row.feature}</td>
                                            <td style={{ padding: '24px 10px', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <X size={16} color="#ff4b4b" /> {row.whatsapp}
                                            </td>
                                            <td style={{ padding: '24px 10px', color: 'var(--umat-green-light)', fontSize: '0.95rem', fontWeight: 700 }}>
                                                <Check size={18} style={{ marginRight: '8px' }} /> {row.sharehub}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '24px', background: 'rgba(0, 104, 55, 0.03)', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
                            <p className="mono" style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Institutional Audit Reference: UMAT-ISA-2024
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;

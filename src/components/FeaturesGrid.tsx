import React from 'react';
import {
    Shield,
    Search,
    Share2,
    Calendar,
    HardDrive,
    Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const FeaturesGrid: React.FC = () => {
    const { t } = useLanguage();
    const features = [
        {
            title: t('features.1.title'),
            desc: t('features.1.desc'),
            icon: <Shield size={28} />,
            color: 'var(--umat-green)'
        },
        {
            title: t('features.2.title'),
            desc: t('features.2.desc'),
            icon: <Search size={28} />,
            color: 'var(--umat-gold)'
        },
        {
            title: t('features.3.title'),
            desc: t('features.3.desc'),
            icon: <Share2 size={28} />,
            color: 'var(--umat-navy)'
        },
        {
            title: 'Strategic Calendar',
            desc: 'Unified meeting hub for synchronizing board agendas and repository access.',
            icon: <Calendar size={28} />,
            color: 'var(--umat-copper)'
        },
        {
            title: 'Insightful Analytics',
            desc: 'Comprehensive oversight of document engagement and board activity trends.',
            icon: <HardDrive size={28} />,
            color: 'var(--umat-green-light)'
        },
        {
            title: 'Institutional Mobility',
            desc: 'Uncompromised security across all devices, ensuring 24/7 governance continuity.',
            icon: <Smartphone size={28} />,
            color: 'var(--umat-gold-dark)'
        }
    ];

    return (
        <section id="features" className="institutional-grid" style={{ padding: '80px 20px', position: 'relative' }}>
            {/* Soft Overlay for the Grid */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, var(--bg-dark) 100%)', zIndex: 0 }} />

            <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                    <div className="mono" style={{ color: 'var(--umat-gold)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 700, letterSpacing: '8px' }}>{t('features.tag')}</div>
                    <h2 className="text-display">{t('features.title')}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
                        {t('features.subtitle')}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="glass-card"
                            style={{
                                padding: '48px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                borderTop: `4px solid ${feature.color}`
                            }}
                        >
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '18px',
                                background: `${feature.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: feature.color,
                                boxShadow: `0 10px 20px -5px ${feature.color}20`
                            }}>
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="playfair" style={{ fontSize: '1.75rem', marginBottom: '12px', color: 'var(--text-main)' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1rem' }}>{feature.desc}</p>
                            </div>

                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '40px' }}
                                style={{ height: '2px', background: feature.color, marginTop: 'auto' }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesGrid;

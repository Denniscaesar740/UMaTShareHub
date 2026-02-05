import React from 'react';
import {
    ArrowRight,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
    onGetStarted: () => void;
    imageSrc: string;
}

const TypewriterText: React.FC<{ text: string; delay?: number; speed?: number; className?: string; style?: React.CSSProperties }> = ({ text, delay = 0, speed = 0.03, className, style }) => {
    const characters = text.split("");

    return (
        <motion.span
            className={className}
            style={{ display: 'inline-block', ...style }}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 1 },
                visible: {
                    opacity: 1,
                    transition: {
                        delayChildren: delay,
                        staggerChildren: speed,
                    },
                },
            }}
        >
            {characters.map((char, index) => (
                <motion.span
                    key={index}
                    variants={{
                        hidden: { opacity: 0, display: 'none' },
                        visible: { opacity: 1, display: 'inline' },
                    }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.span>
    );
};

const Hero: React.FC<HeroProps> = ({ onGetStarted, imageSrc }) => {
    const { t } = useLanguage();
    return (
        <section className="hero-section" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '120px 20px 80px 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Elements */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.03) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />

            <div className="main-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1.3fr', gap: '60px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="mono" style={{
                        color: 'var(--umat-gold)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '6px',
                        textTransform: 'uppercase',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: '40px' }}
                            transition={{ duration: 0.6 }}
                            style={{ height: '2px', background: 'var(--umat-gold)' }}
                        ></motion.span>
                        <TypewriterText text={t('hero.tag')} speed={0.05} />
                    </div>

                    <h1 className="text-display" style={{ marginBottom: '24px' }}>
                        <TypewriterText text={t('hero.title.part1')} delay={1} speed={0.05} />
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.3, duration: 0.5 }}
                            className="text-gradient"
                        >
                            {t('hero.title.highlight')}
                        </motion.span>
                        <TypewriterText text={t('hero.title.part2')} delay={1.8} speed={0.05} />
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        marginBottom: '42px',
                        maxWidth: '600px',
                        lineHeight: 1.6
                    }}>
                        <TypewriterText
                            text={t('hero.subtitle')}
                            delay={3.5}
                            speed={0.015}
                        />
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 5.5, duration: 0.8 }}
                        style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}
                    >
                        <button className="btn-primary" onClick={onGetStarted} style={{ padding: '20px 40px', fontSize: '1.1rem', borderRadius: '14px', boxShadow: '0 15px 30px -5px rgba(0, 104, 55, 0.3)' }}>
                            {t('hero.cta')}
                            <ArrowRight size={22} />
                        </button>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                <ShieldCheck size={20} color="var(--umat-green)" />
                                AES-256 SECURE
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 6.5, duration: 1 }}
                        style={{ marginTop: '60px', display: 'flex', gap: '48px', borderTop: '1px solid var(--glass-border)', paddingTop: '32px' }}
                    >
                        {[
                            { label: t('hero.stat.members'), value: '500+' },
                            { label: t('hero.stat.archives'), value: '12k+' },
                            { label: t('hero.stat.reliability'), value: '99.9%' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <h3 className="playfair" style={{ fontSize: '2.2rem', margin: 0, color: 'var(--text-main)' }}>{stat.value}</h3>
                                <p className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', margin: '4px 0 0 0' }}>{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{ position: 'relative' }}
                >
                    {/* Visual Decorator */}
                    <div style={{
                        position: 'absolute',
                        inset: '-20px',
                        background: 'linear-gradient(135deg, var(--umat-green) 0%, transparent 100%)',
                        opacity: 0.05,
                        borderRadius: '40px',
                        zIndex: -1
                    }}></div>

                    <motion.div
                        whileHover={{ rotateY: -5, rotateX: 5 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className="glass-card"
                        style={{
                            padding: '12px',
                            borderRadius: '32px',
                            background: 'rgba(255,255,255,0.05)',
                            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)',
                            transformStyle: 'preserve-3d',
                            perspective: '1000px'
                        }}
                    >
                        <img
                            src={imageSrc}
                            alt="ShareHub Dashboard"
                            style={{ width: '100%', height: 'auto', borderRadius: '24px', display: 'block' }}
                        />
                    </motion.div>

                    {/* Floating Achievement Card */}
                    <motion.div
                        animate={{ y: [-15, 15, -15] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="glass-card"
                        style={{
                            position: 'absolute',
                            bottom: '10%',
                            right: '-30px',
                            padding: '20px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            background: 'var(--bg-card)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ width: '48px', height: '48px', background: 'var(--umat-gold)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--umat-navy)' }}>
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, color: 'var(--umat-green)' }}>SYNC STATUS</p>
                            <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Active Global Node</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;

import React, { useState, useEffect } from 'react';
import {
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    Globe,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UmatLogo from '../assets/Umatlogo.png';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
    onLoginClick?: () => void;
    onRegisterClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onRegisterClick }) => {
    const { language, setLanguage, t } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('nav.features'), href: '#features' },
        { name: t('nav.about'), href: '#about' },
        { name: t('nav.howItWorks'), href: '#how-it-works' },
        { name: t('nav.support'), href: '#support' }
    ];

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'fr', label: 'Français' },
        { code: 'es', label: 'Español' }
    ];

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: isScrolled ? '15px 0' : '30px 0',
                background: isScrolled ? 'var(--bg-card)' : 'transparent',
                backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                borderBottom: isScrolled ? '1px solid var(--glass-border)' : '1px solid transparent'
            }}
        >
            <div className="main-content" style={{ padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                    <img
                        src={UmatLogo}
                        alt="UMAT Logo"
                        style={{
                            width: '45px',
                            height: 'auto',
                            filter: isScrolled ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none'
                        }}
                    />
                    <div>
                        <h1 className="playfair" style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, letterSpacing: '1px' }}>
                            UMAT <span style={{ color: 'var(--umat-gold)' }}>ShareHub</span>
                        </h1>
                        <p className="mono" style={{ fontSize: '0.65rem', margin: 0, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Secure Academic Cloud
                        </p>
                    </div>
                </div>

                {/* Desktop Nav */}
                <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                    <div style={{ display: 'none', gap: '30px' }} className="desktop-menu-links">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                style={{
                                    textDecoration: 'none',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    transition: 'color 0.3s ease'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--umat-gold)')}
                                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* Language Selector */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-main)',
                                    padding: '8px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Globe size={16} />
                                <span>{languages.find(l => l.code === language)?.label}</span>
                                <ChevronDown size={14} style={{ opacity: 0.6, transform: isLangDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                            </button>

                            <AnimatePresence>
                                {isLangDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: 'absolute',
                                            top: '110%',
                                            right: 0,
                                            width: '160px',
                                            background: 'var(--bg-card)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '16px',
                                            padding: '8px',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                            zIndex: 1001
                                        }}
                                    >
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setLanguage(lang.code as any);
                                                    setIsLangDropdownOpen(false);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: language === lang.code ? 'var(--umat-gold)' : 'var(--text-main)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: language === lang.code ? 600 : 400,
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                {lang.label}
                                                {language === lang.code && <Check size={14} />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>
                        <button
                            className="btn-outline"
                            style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                            onClick={onLoginClick}
                        >
                            {t('nav.login')}
                        </button>
                        <button
                            className="btn-primary"
                            style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                            onClick={onRegisterClick}
                        >
                            {t('nav.register')} <ChevronRight size={16} />
                        </button>
                        <button
                            className="mobile-toggle"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={{ background: 'var(--glass)', border: 'none', color: 'var(--text-main)', padding: '10px', borderRadius: '10px', display: 'flex' }}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            background: 'var(--bg-dark)',
                            borderTop: '1px solid var(--glass-border)',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 600 }}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code as any)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: '1px solid var(--glass-border)',
                                            background: language === lang.code ? 'var(--umat-gold)' : 'transparent',
                                            color: language === lang.code ? 'var(--umat-navy)' : 'var(--text-main)',
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                            <button className="btn-primary" onClick={onRegisterClick} style={{ width: '100%', justifyContent: 'center' }}>
                                {t('nav.register')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @media (min-width: 1024px) {
          .desktop-menu-links { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
        </header>
    );
};

export default Navbar;

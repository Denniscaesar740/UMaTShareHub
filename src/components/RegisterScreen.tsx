import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building, Shield, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import UmatLogo from '../assets/Umatlogo.png';
import { useAuth } from '../context/AuthContext';

interface RegisterScreenProps {
    onRegisterSuccess: () => void;
    onGoBack: () => void;
    onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegisterSuccess, onGoBack, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        title: 'Mr.',
        fullName: '',
        email: '',
        department: '',
        role: 'Board Member',
        password: '',
        confirmPassword: ''
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const { signUp } = useAuth(); // Import useAuth hook

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { title, fullName, email, department, role, password, confirmPassword } = formData;

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await signUp(email, password, {
                full_name: `${title} ${fullName}`,
                department,
                role
            });

            if (error) {
                throw error;
            }
            onRegisterSuccess();
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ width: '100%', maxWidth: '450px', padding: '60px 40px', textAlign: 'center' }}
                >
                    <div style={{ width: '70px', height: '70px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                        <Shield size={32} color="#10b981" />
                    </div>
                    <h2 className="playfair" style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Application Submitted</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
                        Your institutional profile for <strong>{formData.email}</strong> is pending administrative approval.
                        You will be able to access the portal once your account is activated.
                    </p>
                    <button className="btn-primary" onClick={onSwitchToLogin} style={{ width: '100%' }}>
                        Proceed to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '40px 20px'
        }}>
            {/* Background elements */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '180%',
                height: '180%',
                background: 'radial-gradient(circle at center, rgba(177, 140, 58, 0.05) 0%, transparent 60%)',
                zIndex: 0
            }}></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '520px',
                    padding: '50px 40px',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--glass-border)'
                }}
            >
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}>
                        <img
                            src={UmatLogo}
                            alt="UMAT Logo"
                            style={{
                                width: '70px',
                                height: 'auto',
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                            }}
                        />
                    </div>
                    <h2 className="playfair" style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--text-main)' }}>Apply for Access</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join the secured UMAT Academic ShareHub</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    {/* Title & Full Name */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Title</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'var(--bg-card)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Prof.">Prof.</option>
                                    <option value="Dr.">Dr.</option>
                                    <option value="Mr.">Mr.</option>
                                    <option value="Mrs.">Mrs.</option>
                                    <option value="Ms.">Ms.</option>
                                    <option value="Ing.">Ing.</option>
                                    <option value="Rev.">Rev.</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    placeholder="Kwame Mensah"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 48px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'var(--bg-card)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Staff Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="k.mensah@umat.edu.gh"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Institutional Role */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Institutional Role</label>
                        <div style={{ position: 'relative' }}>
                            <Shield size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <select
                                value={formData.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    appearance: 'none'
                                }}
                            >
                                <option value="Board Member">Board Member</option>
                                <option value="Viewer">Viewer</option>
                                <option value="Guest">Guest</option>
                            </select>
                        </div>
                    </div>

                    {/* Department */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Department/Unit</label>
                        <div style={{ position: 'relative' }}>
                            <Building size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <select
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    appearance: 'none'
                                }}
                            >
                                <option value="">Select Department</option>
                                <option value="Academic Affairs">Academic Affairs</option>
                                <option value="Computer Science">Computer Science & Engineering</option>
                                <option value="Mining Engineering">Mining Engineering</option>
                                <option value="Registry">Registry</option>
                                <option value="Finance">Finance</option>
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Create a strong password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                placeholder="Retype password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '14px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            marginTop: '10px',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Application'} <ArrowRight size={20} />
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--umat-green)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Staff Login
                        </button>
                    </p>
                </div>

                {/* Back Link */}
                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={onGoBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            opacity: 0.8,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        <ArrowLeft size={16} /> Return to Home
                    </button>
                </div>

            </motion.div>
        </div>
    );
};

export default RegisterScreen;

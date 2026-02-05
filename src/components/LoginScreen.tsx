import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import UmatLogo from '../assets/Umatlogo.png';
import { useAuth } from '../context/AuthContext';
import PromptModal from './PromptModal';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';

interface LoginScreenProps {
    onGoBack: () => void;
    onSwitchToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onGoBack, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForgotModal, setShowForgotModal] = useState(false);

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        type: ConfirmType;
        confirmText?: string;
        confirmOnly?: boolean;
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { },
        type: 'info',
        confirmOnly: false
    });

    const { signIn, resetPassword } = useAuth();

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        // If email field is already filled and valid, use it directly
        if (email && email.includes('@')) {
            handleResetSubmit(email);
        } else {
            // Otherwise open modal to ask for it
            setShowForgotModal(true);
        }
    };

    const handleResetSubmit = async (emailValue: string) => {
        const { error } = await resetPassword(emailValue);
        if (error) {
            setConfirmModal({
                isOpen: true,
                title: 'Reset Error',
                description: `Failed to send reset email: ${error.message}`,
                type: 'danger',
                confirmText: 'Close',
                confirmOnly: true,
                onConfirm: () => { }
            });
        } else {
            setConfirmModal({
                isOpen: true,
                title: 'Email Sent',
                description: 'A password reset link has been dispatched to your institutional inbox. Please check your mail.',
                type: 'success',
                confirmText: 'Got it',
                confirmOnly: true,
                onConfirm: () => { }
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await signIn(email, password);
            if (error) {
                throw error;
            }
            // Login successful is handled by auth state change
            console.log('Login successful!');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background elements to match the app theme */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle at center, rgba(0, 104, 55, 0.05) 0%, transparent 60%)',
                zIndex: 0
            }}></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card login-card"
                style={{
                    width: '95%',
                    maxWidth: '480px',
                    padding: '40px 24px',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--glass-border)'
                }}
            >
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <img
                            src={UmatLogo}
                            alt="UMAT Logo"
                            style={{
                                width: '80px',
                                height: 'auto',
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                            }}
                        />
                    </div>
                    <h2 className="playfair" style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-main)' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Secure access for Academic Board Members</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            Staff Email ID
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="staff@umat.edu.gh"
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
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--umat-green)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                Password
                            </label>
                            <span
                                onClick={handleForgotPassword}
                                style={{ fontSize: '0.8rem', color: 'var(--umat-gold)', textDecoration: 'none', cursor: 'pointer' }}
                            >
                                Forgot Password?
                            </span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
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
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--umat-green)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
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
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Secure Login'} <ArrowRight size={20} />
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        New to the Academic Board?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--umat-green)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Apply for Access
                        </button>
                    </p>
                </div>

                {/* Back Link */}
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
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

            <PromptModal
                isOpen={showForgotModal}
                onClose={() => setShowForgotModal(false)}
                onSubmit={handleResetSubmit}
                title="Reset Password"
                description="Please enter your email address to receive password reset instructions."
                placeholder="staff@umat.edu.gh"
                confirmText="Send Reset Link"
            />
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
                confirmOnly={confirmModal.confirmOnly}
            />
        </div>
    );
};

export default LoginScreen;

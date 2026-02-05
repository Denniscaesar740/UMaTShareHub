import React, { useState } from 'react';
import {
    Lock,
    Smartphone,
    Key,
    Eye,
    EyeOff,
    ShieldCheck,
    History,
    Globe,
    Zap,
    MapPin,
    Trash2,
    Download
} from 'lucide-react';
import AuditTrailModal from './AuditTrailModal';
import { supabase, logAction } from '../lib/supabase';

import { useAuth } from '../context/AuthContext';

import { useEffect } from 'react';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';

const SecuritySettings: React.FC = () => {
    const { user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(true);
    const [loginAlerts, setLoginAlerts] = useState(true);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', next: '' });
    const [sessionTimeout, setSessionTimeout] = useState('30');
    const [securityLogs, setSecurityLogs] = useState<any[]>([]);

    // Modal State
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
        type: 'danger',
        confirmOnly: false,
    });

    useEffect(() => {
        if (user) {
            fetchLogs();
        }
    }, [user]);

    const fetchLogs = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            if (data) {
                setSecurityLogs(data.map(log => ({
                    action: log.action,
                    device: log.details?.device || 'Institutional System',
                    time: new Date(log.created_at).toLocaleTimeString() + ' Today',
                    status: 'success',
                    ip: log.details?.ip || 'Institutional NW'
                })));
            }
        } catch (error) {
            console.error('Error fetching security logs:', error);
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchLogs();

        const channel = supabase
            .channel(`security-logs:${user.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs', filter: `user_id=eq.${user.id}` },
                () => fetchLogs()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleUpdatePassphrase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwords.next) {
            setConfirmModal({
                isOpen: true,
                title: 'Missing Information',
                description: 'Please enter a new passphrase to update your credentials.',
                type: 'warning',
                confirmText: 'Got it',
                confirmOnly: true,
                onConfirm: () => { }
            });
            return;
        }

        if (!user) return;

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.next
            });

            if (error) throw error;

            setConfirmModal({
                isOpen: true,
                title: 'Passphrase Updated',
                description: 'Your passphrase has been updated successfully across all institutional systems.',
                type: 'success',
                confirmText: 'Done',
                confirmOnly: true,
                onConfirm: () => { }
            });

            // Log this action
            await logAction(
                user.id,
                'PASSWORD_CHANGE',
                'user',
                user.id,
                {
                    device: navigator.userAgent.slice(0, 50),
                    ip: 'Auto-detected'
                }
            );

            setPasswords({ current: '', next: '' });
        } catch (error: any) {
            setConfirmModal({
                isOpen: true,
                title: 'Update Error',
                description: `Failed to update passphrase: ${error.message}`,
                type: 'danger',
                confirmText: 'Close',
                confirmOnly: true,
                onConfirm: () => { }
            });
        }
    };

    const handleRevokeAllSessions = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Emergency Account Lock',
            description: 'EMERGENCY LOCK: This will sign you out of ALL devices and invalidate all active sessions. Proceed?',
            type: 'danger',
            confirmText: 'LOCK ACCOUNT',
            onConfirm: async () => {
                try {
                    const { error } = await supabase.auth.signOut({ scope: 'global' });
                    if (error) throw error;

                    setConfirmModal({
                        isOpen: true,
                        title: 'Lock Engaged',
                        description: 'Global security lock engaged. All sessions revoked. You will be redirected shortly.',
                        type: 'success',
                        confirmText: 'Reload Now',
                        confirmOnly: true,
                        onConfirm: () => window.location.reload()
                    });
                } catch (err: any) {
                    console.error("Failed to engage emergency lock:", err);
                    setConfirmModal({
                        isOpen: true,
                        title: 'Lock Failed',
                        description: `Failed to engage emergency lock: ${err.message}`,
                        type: 'danger',
                        confirmText: 'Retry',
                        confirmOnly: true,
                        onConfirm: () => { }
                    });
                }
            }
        });
    };

    const handleExportKeys = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Generating Backup',
            description: 'Generating secure backup keys... Your institutional repository vault download will start automatically.',
            type: 'info',
            confirmText: 'Begin Download',
            confirmOnly: true,
            onConfirm: () => { }
        });
    };

    return (
        <div className="main-content">
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Security Controls</h1>
                <p style={{ color: 'var(--text-muted)' }}>Advanced protection for your UMaT digital assets.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* MFA & Authentication */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '10px', background: 'rgba(0, 107, 63, 0.1)', borderRadius: '12px' }}>
                                <ShieldCheck color="var(--umat-green)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Authentication Methods</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Two-Step Verification (MFA)</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Protect your account with an extra layer of security via SMS or Authenticator.</p>
                                </div>
                                <div
                                    onClick={() => setMfaEnabled(!mfaEnabled)}
                                    style={{
                                        width: '50px',
                                        height: '26px',
                                        borderRadius: '20px',
                                        background: mfaEnabled ? 'var(--umat-green)' : 'var(--glass-border)',
                                        padding: '3px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        justifyContent: mfaEnabled ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Immediate Login Alerts</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get notified instantly on your phone when a new login occurs.</p>
                                </div>
                                <div
                                    onClick={() => setLoginAlerts(!loginAlerts)}
                                    style={{
                                        width: '50px',
                                        height: '26px',
                                        borderRadius: '20px',
                                        background: loginAlerts ? 'var(--umat-green)' : 'var(--glass-border)',
                                        padding: '3px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        justifyContent: loginAlerts ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Management */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '10px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px' }}>
                                <Lock color="var(--umat-gold)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Passphrase Update</h3>
                        </div>

                        <form onSubmit={handleUpdatePassphrase} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Current Passphrase"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 48px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New Secure Passphrase"
                                        value={passwords.next}
                                        onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                                        style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 48px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                                    />
                                    <div
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: 'fit-content', alignSelf: 'flex-end' }}>Sync Everywhere</button>
                        </form>
                    </div>

                    {/* Advanced Controls */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                                <Zap color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Advanced Security Tools</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div
                                className="glass-card shadow-hover"
                                style={{ padding: '20px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.3)' }}
                                onClick={handleRevokeAllSessions}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#ef4444' }}>
                                    <Trash2 size={18} />
                                    <span style={{ fontWeight: 600 }}>Emergency Lock</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Revoke all active sessions and force re-authentication on all devices.</p>
                            </div>

                            <div
                                className="glass-card shadow-hover"
                                style={{ padding: '20px', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.05)' }}
                                onClick={handleExportKeys}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--umat-green)' }}>
                                    <Download size={18} />
                                    <span style={{ fontWeight: 600 }}>Backup Vault</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Export your encrypted security keys for offline recovery purposes.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Active Sessions */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Smartphone size={18} color="var(--umat-gold)" /> Managed Sessions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ padding: '8px', background: 'var(--glass)', borderRadius: '8px' }}>
                                    <Smartphone size={16} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>iPhone 15 Pro</p>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--umat-green)' }}>Active Now • Tarkwa, GH</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ padding: '8px', background: 'var(--glass)', borderRadius: '8px' }}>
                                    <Globe size={16} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Chrome on Windows</p>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last active: 2 hrs ago • Kumasi, GH</p>
                                </div>
                                <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}>Logout</button>
                            </div>
                        </div>
                    </div>

                    {/* IP Whitelisting / Session Prefs */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Session Preferences</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Auto-Logout Period</label>
                            <select
                                value={sessionTimeout}
                                onChange={(e) => setSessionTimeout(e.target.value)}
                                style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                            >
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="60">1 Hour</option>
                                <option value="0">Never (Unsafe)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <MapPin size={14} />
                            <span>Set Trusted IP Range</span>
                        </div>
                    </div>

                    {/* Audit Trail Shortcut */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <History size={18} /> Audit Trail
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {securityLogs.slice(0, 2).map((log, idx) => (
                                <div key={idx} style={{ fontSize: '0.8rem' }}>
                                    <p style={{ margin: 0, fontWeight: 500, color: log.status === 'alert' ? '#ef4444' : 'var(--text-main)' }}>{log.action}</p>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.time} • {log.ip}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn-outline"
                            style={{ width: '100%', marginTop: '16px', fontSize: '0.8rem' }}
                            onClick={() => setIsAuditModalOpen(true)}
                        >
                            View All Logs
                        </button>
                    </div>
                </div>
            </div>

            <AuditTrailModal
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
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

export default SecuritySettings;

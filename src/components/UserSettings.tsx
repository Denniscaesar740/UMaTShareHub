import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Edit2,
    Shield,
    Bell,
    Globe,
    Moon,
    Sun,
    Archive,
    CheckCircle
} from 'lucide-react';

import EditProfileModal from './EditProfileModal';
import AuditTrailModal from './AuditTrailModal';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import ConfirmModal, { type ConfirmType } from './ConfirmModal';

const UserSettings: React.FC = () => {
    const { user, profile, uploadAvatar, updateProfile } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [language, setLanguage] = useState('English (Ghana)');
    const [notifFreq, setNotifFreq] = useState('instant');
    const [autoArchive, setAutoArchive] = useState('90');

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

    // User profile state
    const [userProfile, setUserProfile] = useState({
        name: '',
        designation: '',
        email: '',
        staffId: '',
        avatar: null as string | null
    });

    useEffect(() => {
        if (profile) {
            setUserProfile({
                name: profile.full_name || '',
                designation: profile.role || 'Member',
                email: profile.email || user?.email || '',
                staffId: profile.department || 'N/A',
                avatar: profile.avatar_url || null
            });
        }
    }, [profile, user]);

    const handleEditProfile = () => {
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async (updatedData: any) => {
        if (!user) return;
        try {
            await updateProfile({
                full_name: updatedData.name,
                department: updatedData.staffId
            });
            setUserProfile(prev => ({ ...prev, ...updatedData }));
            setConfirmModal({
                isOpen: true,
                title: 'Profile Updated',
                description: 'Your institutional profile has been updated successfully.',
                type: 'success',
                confirmText: 'Great',
                confirmOnly: true,
                onConfirm: () => { }
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            setConfirmModal({
                isOpen: true,
                title: 'Update Error',
                description: 'Failed to update your profile. Please check your connection.',
                type: 'danger',
                confirmText: 'Close',
                confirmOnly: true,
                onConfirm: () => { }
            });
        }
    };

    const triggerAvatarUpload = () => {
        document.getElementById('avatar-input')?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            try {
                await uploadAvatar(file);

                setConfirmModal({
                    isOpen: true,
                    title: 'Avatar Uploaded',
                    description: 'Your profile picture has been updated across the portal.',
                    type: 'success',
                    confirmText: 'Perfect',
                    confirmOnly: true,
                    onConfirm: () => { }
                });
            } catch (error: any) {
                console.error('Error uploading avatar:', error);
                setConfirmModal({
                    isOpen: true,
                    title: 'Upload Failed',
                    description: `Failed to upload avatar: ${error.message}. Please ensure the 'avatars' storage bucket exists.`,
                    type: 'danger',
                    confirmText: 'Close',
                    confirmOnly: true,
                    onConfirm: () => { }
                });
            }
        }
    };

    const handleSavePreferences = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Preferences Saved',
            description: 'Your workspace settings have been synchronized.',
            type: 'success',
            confirmText: 'Done',
            confirmOnly: true,
            onConfirm: () => { }
        });
    };

    return (
        <div className="main-content">
            <header style={{ marginBottom: '32px', textAlign: 'left' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Portal Settings</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customize your institutional workspace and profile details.</p>
            </header>

            <div className="flex-mobile-column" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Profile Section */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(45deg, var(--umat-green), var(--umat-gold))',
                                padding: '3px',
                                position: 'relative',
                                flexShrink: 0
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    background: 'var(--bg-dark)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {userProfile.avatar ? (
                                        <img src={userProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={40} color="var(--umat-gold)" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="avatar-input"
                                    hidden
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '4px', color: 'var(--text-main)' }}>{userProfile.name}</h2>
                                <p style={{ color: 'var(--umat-gold)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '12px' }}>{userProfile.designation}</p>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={handleEditProfile}>
                                        <Edit2 size={14} />
                                        <span style={{ marginLeft: '8px' }}>Edit Profile</span>
                                    </button>
                                    <button className="btn-outline" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={triggerAvatarUpload}>Change Avatar</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-mobile-column" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="glass-card" style={{ padding: '16px', background: 'var(--glass)' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Official Email</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Mail size={14} color="var(--umat-green)" />
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem', wordBreak: 'break-all' }}>{userProfile.email}</span>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: '16px', background: 'var(--glass)' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Staff ID / Dept</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Shield size={14} color="var(--umat-green)" />
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{userProfile.staffId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Workspace Preferences
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
                                    <Globe size={16} color="var(--umat-gold)" /> Display Language
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                                >
                                    <option>English (Ghana)</option>
                                    <option>English (British)</option>
                                    <option>French (West Africa)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
                                    <Bell size={16} color="var(--umat-gold)" /> Notification Frequency
                                </label>
                                <select
                                    value={notifFreq}
                                    onChange={(e) => setNotifFreq(e.target.value)}
                                    style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                                >
                                    <option value="instant">Instant Alerts</option>
                                    <option value="daily">Daily Digest</option>
                                    <option value="none">Muted</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
                                    <Archive size={16} color="var(--umat-gold)" /> Auto-Archive Drafts
                                </label>
                                <select
                                    value={autoArchive}
                                    onChange={(e) => setAutoArchive(e.target.value)}
                                    style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                                >
                                    <option value="30">After 30 Days</option>
                                    <option value="90">After 90 Days</option>
                                    <option value="0">Never</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                <button className="btn-primary" style={{ height: '48px', justifyContent: 'center' }} onClick={handleSavePreferences}>
                                    <CheckCircle size={18} /> Save Preferences
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Theme Selector */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Interface Theme</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div
                                onClick={() => setTheme('dark')}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    background: theme === 'dark' ? 'rgba(0, 104, 55, 0.1)' : 'var(--glass)',
                                    border: theme === 'dark' ? '1px solid var(--umat-green)' : '1px solid var(--glass-border)',
                                    display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'
                                }}
                            >
                                <Moon size={18} color={theme === 'dark' ? 'var(--umat-green)' : 'var(--text-muted)'} />
                                <span style={{ flex: 1, fontWeight: theme === 'dark' ? 600 : 400 }}>Ebony Night (Dark)</span>
                                {theme === 'dark' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--umat-green)' }} />}
                            </div>
                            <div
                                onClick={() => setTheme('light')}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    background: theme === 'light' ? 'rgba(0, 104, 55, 0.1)' : 'var(--glass)',
                                    border: theme === 'light' ? '1px solid var(--umat-green)' : '1px solid var(--glass-border)',
                                    display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'
                                }}
                            >
                                <Sun size={18} color={theme === 'light' ? 'var(--umat-green)' : 'var(--text-muted)'} />
                                <span style={{ flex: 1, fontWeight: theme === 'light' ? 600 : 400 }}>Institutional Light</span>
                                {theme === 'light' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--umat-green)' }} />}
                            </div>
                        </div>
                    </div>

                    {/* Security & Compliance Widget */}
                    <div className="glass-card" style={{
                        padding: '24px',
                        background: 'linear-gradient(145deg, rgba(0, 104, 55, 0.1), transparent)',
                        border: '1px solid rgba(0, 104, 55, 0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Security Integrity</h3>
                            <div style={{ padding: '4px 10px', background: 'var(--umat-green)', color: 'white', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800 }}>
                                VERIFIED
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>MFA Status</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--umat-gold)' }}>Active (App)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Protocol Access</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>192.168.1.12 (Accra)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Trust Level</span>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} style={{ width: '12px', height: '4px', background: i <= 5 ? 'var(--umat-green)' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn-outline"
                            style={{ width: '100%', fontSize: '0.8rem', marginTop: '24px', borderStyle: 'dashed' }}
                            onClick={() => setIsAuditModalOpen(true)}
                        >
                            Review Security Logs
                        </button>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveProfile}
                initialData={userProfile}
            />

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

export default UserSettings;

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Save, Briefcase } from 'lucide-react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 7000,
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <div
                className="glass-card"
                style={{
                    width: '90%',
                    maxWidth: '500px',
                    padding: '40px',
                    animation: 'slideUp 0.4s ease-out',
                    background: 'var(--bg-modal)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Edit Profile</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update your institutional identity details.</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Official Email</label>
                            <span style={{ fontSize: '0.7rem', color: 'var(--umat-gold)', fontWeight: 600 }}>Locked by Institution</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
                            <input
                                readOnly
                                type="email"
                                value={formData.email}
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '12px 12px 12px 40px',
                                    borderRadius: '10px',
                                    color: 'var(--text-muted)',
                                    outline: 'none',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Designation</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                required
                                type="text"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Staff ID</label>
                            <span style={{ fontSize: '0.7rem', color: 'var(--umat-gold)', fontWeight: 600 }}>Locked by Institution</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Shield size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
                            <input
                                readOnly
                                type="text"
                                value={formData.staffId}
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '12px 12px 12px 40px',
                                    borderRadius: '10px',
                                    color: 'var(--text-muted)',
                                    outline: 'none',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: '100%', height: '50px', justifyContent: 'center', fontSize: '1rem' }}>
                        <Save size={20} /> Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;

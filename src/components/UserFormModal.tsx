import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Mail,
    Briefcase,
    Shield,
    CheckCircle,
    Save,
    AlertCircle
} from 'lucide-react';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: any) => void;
    initialData?: any;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        role: 'Board Member',
        status: 'Active'
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                email: '',
                department: '',
                role: 'Board Member',
                status: 'Active'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
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
                    maxWidth: '550px',
                    padding: '40px',
                    animation: 'slideUp 0.4s ease-out',
                    background: 'var(--bg-modal)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{initialData ? 'Edit Institutional User' : 'Register New User'}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure access levels for institutional members.</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name & Honorific</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                required
                                type="text"
                                placeholder="e.g. Prof. Jane Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Institutional Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                required
                                type="email"
                                placeholder="user@umat.edu.gh"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Geomatic Eng."
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security Role</label>
                            <div style={{ position: 'relative' }}>
                                <Shield size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                                >
                                    <option value="Admin">System Admin</option>
                                    <option value="Board Member">Board Member</option>
                                    <option value="Viewer">Academic Viewer</option>
                                    <option value="Guest">Guest Access</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account Status</label>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {['Active', 'Pending', 'Inactive'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status })}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--glass-border)',
                                        background: formData.status === status ? 'var(--umat-green)' : 'var(--glass)',
                                        color: formData.status === status ? 'white' : 'var(--text-muted)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {status === 'Active' && <CheckCircle size={14} />}
                                    {status === 'Pending' && <AlertCircle size={14} />}
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--umat-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={14} /> Note: New users will receive an automated passphrase setup email.
                        </p>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: '100%', height: '50px', justifyContent: 'center', fontSize: '1rem' }}>
                        <Save size={20} /> {initialData ? 'Update Member Profile' : 'Authorize New Access'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;

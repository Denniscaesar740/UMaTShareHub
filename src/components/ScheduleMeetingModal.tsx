import React, { useState, useEffect } from 'react';
import {
    X,
    Calendar,
    Clock,
    MapPin,
    Users,
    Link as LinkIcon,
    FilePlus,
    ChevronDown,
    Save,
    Loader2,
    Paperclip,
    Check,
    Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';

import { useMeetings } from '../context/MeetingContext';

interface ScheduleMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({ isOpen, onClose }) => {
    const { scheduleMeeting } = useMeetings();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        endTime: '',
        location: '',
        link: '',
        category: 'Academic',
        description: ''
    });

    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [showUserSelect, setShowUserSelect] = useState(false);

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

    useEffect(() => {
        if (isOpen) {
            fetchProfiles();
        }
    }, [isOpen]);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name');

            if (error) throw error;
            if (data) {
                setAvailableUsers(data);
            }
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleUser = (userId: string) => {
        setInvitedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Upload files first (Mock)
            const uploadedDocs = [];
            for (const file of attachedFiles) {
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload
                // Create mock URL
                const mockUrl = URL.createObjectURL(file);
                uploadedDocs.push({ name: file.name, url: mockUrl });
            }

            await scheduleMeeting({
                title: formData.title,
                date: formData.date,
                start_time: formData.time,
                end_time: formData.endTime,
                location: formData.location,
                link: formData.link,
                description: formData.description,
                category: formData.category,
                attendees: invitedUsers.length,
                attendee_list: invitedUsers,
                attached_docs: uploadedDocs
            });

            setConfirmModal({
                isOpen: true,
                title: 'Meeting Synchronized',
                description: 'The board meeting has been scheduled. Institutional notifications and calendar invites have been dispatched.',
                type: 'success',
                confirmText: 'Done',
                confirmOnly: true,
                onConfirm: onClose
            });
        } catch (error: any) {
            console.error(error);
            setConfirmModal({
                isOpen: true,
                title: 'Scheduling Failed',
                description: `Failed to broadcast meeting details: ${error.message || 'Check connection'}`,
                type: 'danger',
                confirmText: 'Close',
                confirmOnly: true,
                onConfirm: () => { }
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredUsers = availableUsers.filter(u =>
        u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

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
                zIndex: 5000,
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '90%',
                    maxWidth: '650px',
                    padding: '40px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    animation: 'slideUp 0.4s ease-out',
                    background: 'var(--bg-modal)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    color: 'var(--text-main)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', color: 'var(--text-main)' }}>Schedule Board Meeting</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill in the details to notify institutional board members.</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Meeting Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Q1 Strategic Review"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    required
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Start Time</label>
                            <div style={{ position: 'relative' }}>
                                <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    required
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Location / Room</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="e.g. Senate Room A"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Category</label>
                            <div style={{ position: 'relative' }}>
                                <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                                >
                                    <option value="Academic">Academic</option>
                                    <option value="Board">Board Plenary</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Development">Development</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Virtual Meeting Link (Zoom/Teams)</label>
                        <div style={{ position: 'relative' }}>
                            <LinkIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="url"
                                placeholder="https://zoom.us/j/..."
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Description / Brief Agenda</label>
                        <textarea
                            placeholder="Provide a short overview of the meeting topics..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', height: '100px', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none', resize: 'none' }}
                        ></textarea>
                    </div>

                    {/* Invite Members Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Invite Attendees ({invitedUsers.length})</label>
                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => setShowUserSelect(!showUserSelect)}
                                style={{ width: '100%', justifyContent: 'space-between' }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={18} /> {invitedUsers.length > 0 ? `${invitedUsers.length} Selected` : 'Select Members'}
                                </span>
                                <ChevronDown size={16} />
                            </button>

                            {showUserSelect && (
                                <div className="glass-card" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', zIndex: 10, marginTop: '8px', padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                                        <Search size={14} color="var(--text-muted)" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search members..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    {filteredUsers.map(u => (
                                        <div
                                            key={u.id}
                                            onClick={() => toggleUser(u.id)}
                                            style={{
                                                padding: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                borderRadius: '6px',
                                                background: invitedUsers.includes(u.id) ? 'rgba(0, 104, 55, 0.1)' : 'transparent'
                                            }}
                                            className="hover-bg"
                                        >
                                            <span style={{ fontSize: '0.9rem' }}>{u.full_name || u.email}</span>
                                            {invitedUsers.includes(u.id) && <Check size={14} color="var(--umat-green)" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attach Documents Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Attachments</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {attachedFiles.map((file, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid #e2e8f0', color: '#475569' }}>
                                    <Paperclip size={12} />
                                    <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                    <X size={12} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => removeFile(index)} />
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => document.getElementById('meeting-file-input')?.click()}
                                style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', height: 'auto', minHeight: '32px' }}
                            >
                                <FilePlus size={14} style={{ marginRight: '6px' }} /> Add Document
                            </button>
                            <input
                                id="meeting-file-input"
                                type="file"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ marginTop: '20px', width: '100%', height: '50px', justifyContent: 'center', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {loading ? 'Scheduling...' : 'Schedule & Notify Board'}
                    </button>
                </form>

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
        </div>
    );
};

export default ScheduleMeetingModal;

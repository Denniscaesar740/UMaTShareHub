import React, { useState, useCallback, useEffect } from 'react';
import {
    X,
    Upload,
    Check,
    FileText,
    Trash2,
    Plus,
    Users,
    User,
    Lock,
    Loader2,
    ChevronDown
} from 'lucide-react';

import { useFiles } from '../context/FileContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';

interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    uploadTo?: string; // Target folder name
    targetFolderId?: string | null;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, uploadTo, targetFolderId = null }) => {
    const { uploadFile } = useFiles();
    const { user } = useAuth();
    const { createNotification } = useNotifications();
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [category, setCategory] = useState('General Board Documents');
    const [loading, setLoading] = useState(false);
    const [visibility, setVisibility] = useState<'everyone' | 'specific' | 'private'>('everyone');
    const [shareWith, setShareWith] = useState<{ id: string, name: string }[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [profiles, setProfiles] = useState<{ id: string, full_name: string, role: string }[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(targetFolderId);
    const [selectedFolderName, setSelectedFolderName] = useState<string>(uploadTo || 'Root Repository');
    const [allFolders, setAllFolders] = useState<{ id: string, name: string }[]>([]);

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
        setSelectedFolderId(targetFolderId);
        setSelectedFolderName(uploadTo || 'Root Repository');
    }, [targetFolderId, uploadTo, isOpen]);

    useEffect(() => {
        const fetchFolders = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('files')
                    .select('id, name')
                    .eq('type', 'folder')
                    .eq('is_deleted', false)
                    .or(`user_id.eq.${user.id},visibility.eq.everyone,shared_with.cs.{${user.id}}`);

                if (error) throw error;
                if (data) setAllFolders(data);
            } catch (error) {
                console.error("Error fetching folders", error);
            }
        };

        if (isOpen) {
            fetchFolders();
        }
    }, [isOpen, user]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .neq('id', user?.id || '')
                    .order('full_name');

                if (error) throw error;
                if (data) setProfiles(data);
            } catch (error) {
                console.error("Error fetching profiles", error);
            }
        };

        if (isOpen && user) {
            fetchProfiles();
        }
    }, [isOpen, user]);

    const filteredUsers = profiles.filter(u =>
        u.full_name.toLowerCase().includes(userSearch.toLowerCase()) &&
        !shareWith.some(s => s.id === u.id)
    );

    const toggleUser = (userId: string, userName: string) => {
        setShareWith(prev =>
            prev.some(u => u.id === userId)
                ? prev.filter(u => u.id !== userId)
                : [...prev, { id: userId, name: userName }]
        );
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.php', '.pl', '.py', '.js', '.vbs', '.msi'];

    const processFiles = (uploadedFiles: FileList | null) => {
        if (!uploadedFiles) return;

        const newFiles: UploadFile[] = [];
        const ignoredFiles: string[] = [];

        Array.from(uploadedFiles).forEach(file => {
            // 1. Check Size
            if (file.size > MAX_FILE_SIZE) {
                ignoredFiles.push(`${file.name} (Too large, max 50MB)`);
                return;
            }

            // 2. Check Extension (Security)
            const ext = '.' + file.name.split('.').pop()?.toLowerCase();
            if (BLOCKED_EXTENSIONS.includes(ext)) {
                ignoredFiles.push(`${file.name} (File type not allowed)`);
                return;
            }

            newFiles.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                progress: 0,
                status: 'pending'
            });
        });

        if (ignoredFiles.length > 0) {
            setConfirmModal({
                isOpen: true,
                title: 'Security Sync Blocked',
                description: `The following assets were rejected by institutional security scan:\n\n${ignoredFiles.join('\n')}`,
                type: 'warning',
                confirmText: 'Acknowledge',
                confirmOnly: true,
                onConfirm: () => { }
            });
        }

        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        processFiles(e.dataTransfer.files);
    }, []);

    const handleFinalUpload = async () => {
        setLoading(true);
        try {
            for (const fileObj of files) {
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading' } : f));
                const shareWithIds = shareWith.map(s => s.id);
                await uploadFile(fileObj.file, selectedFolderId, category, visibility, shareWithIds, (percent) => {
                    setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: percent } : f));
                });
                setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'completed', progress: 100 } : f));
            }

            if (user && files.length > 0) {
                await createNotification(
                    user.id,
                    'Files Uploaded Successfully',
                    `${files.length} documents have been uploaded and secured in ${selectedFolderName}.`,
                    'file'
                );
            }

            setTimeout(onClose, 1000);
        } catch (error: any) {
            console.error(error);
            setConfirmModal({
                isOpen: true,
                title: 'Transmission Failed',
                description: `Failed to synchronize assets with institutional storage: ${error.message || 'Check connection'}`,
                type: 'danger',
                confirmText: 'Retry Later',
                confirmOnly: true,
                onConfirm: () => { }
            });
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    if (!isOpen) return null;

    const visibilityOptions = [
        { id: 'everyone', label: 'Everyone', icon: <Users size={18} />, desc: 'All board members' },
        { id: 'specific', label: 'Specific', icon: <User size={18} />, desc: 'Select individuals' },
        { id: 'private', label: 'Only Me', icon: <Lock size={18} />, desc: 'Private vault' },
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div className="glass-card" style={{
                width: '90%',
                maxWidth: '740px',
                padding: '40px',
                position: 'relative',
                animation: 'slideUp 0.4s ease-out',
                background: 'var(--bg-modal)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', color: 'var(--text-muted)' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Upload Institutional Files</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Destination:</span>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <select
                            value={selectedFolderId || ''}
                            onChange={(e) => {
                                const id = e.target.value || null;
                                setSelectedFolderId(id);
                                setSelectedFolderName(id ? allFolders.find(f => f.id === id)?.name || 'Folder' : 'Root Repository');
                            }}
                            style={{
                                width: '100%',
                                background: 'rgba(0, 104, 55, 0.1)',
                                border: 'none',
                                color: 'var(--umat-green)',
                                padding: '8px 36px 8px 16px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Root Repository</option>
                            {allFolders.map(folder => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--umat-green)' }} />
                    </div>
                    {loading && <Loader2 size={14} className="animate-spin" color="var(--umat-green)" />}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                            Target Category
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--glass)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-main)',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    outline: 'none',
                                    appearance: 'none'
                                }}
                            >
                                <option>General Board Documents</option>
                                <option>Meeting Minutes</option>
                                <option>Financial Reports</option>
                                <option>Curriculum Review</option>
                                <option>Research Proposals</option>
                            </select>
                            <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                            Who can see this?
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {visibilityOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => setVisibility(opt.id as any)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        background: visibility === opt.id ? 'rgba(0, 107, 63, 0.1)' : 'var(--glass)',
                                        border: visibility === opt.id ? '1px solid var(--umat-green)' : '1px solid var(--glass-border)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ color: visibility === opt.id ? 'var(--umat-green)' : 'var(--text-muted)', marginBottom: '4px' }}>
                                        {opt.icon}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>{opt.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {visibility === 'specific' && (
                    <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Select Institutional Users</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{shareWith.length} selected</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or role..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px', color: 'var(--text-main)', marginBottom: '12px', outline: 'none', cursor: 'text' }}
                        />

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: (shareWith.length > 0 ? '12px' : '0') }}>
                            {shareWith.map(user => (
                                <span key={user.id} style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: 'var(--umat-green)',
                                    fontSize: '0.75rem',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {user.name} <X size={12} onClick={() => toggleUser(user.id, user.name)} style={{ cursor: 'pointer' }} />
                                </span>
                            ))}
                        </div>

                        {userSearch && filteredUsers.length > 0 && (
                            <div style={{ maxHeight: '120px', overflowY: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                                {filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleUser(user.id, user.full_name)}
                                        style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        className="shadow-hover"
                                    >
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem' }}>{user.full_name}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</p>
                                        </div>
                                        <Plus size={14} color="var(--umat-gold)" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${dragActive ? 'var(--umat-gold)' : 'var(--glass-border)'}`,
                        borderRadius: '16px',
                        padding: '40px',
                        textAlign: 'center',
                        background: dragActive ? 'rgba(251, 191, 36, 0.05)' : 'var(--glass)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        marginBottom: '32px'
                    }}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => processFiles(e.target.files)}
                    />
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(0, 107, 63, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto'
                    }}>
                        <Upload size={24} color="var(--umat-green)" />
                    </div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Click or Drop files here</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security scan will be performed on upload</p>
                </div>

                {files.length > 0 && (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '10px', marginBottom: '32px' }}>
                        {files.map(fileObj => (
                            <div key={fileObj.id} style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <FileText size={18} color="var(--umat-green)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{fileObj.file.name.length > 30 ? fileObj.file.name.substring(0, 30) + '...' : fileObj.file.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(fileObj.progress)}%</span>
                                    </div>
                                    <div style={{ height: '3px', background: 'var(--glass-border)', borderRadius: '10px' }}>
                                        <div style={{ width: `${fileObj.progress}%`, height: '100%', background: fileObj.status === 'completed' ? '#10b981' : 'var(--umat-gold)', borderRadius: '10px', transition: 'width 0.3s ease' }} />
                                    </div>
                                </div>
                                {fileObj.status === 'completed' ? (
                                    <Check size={18} color="#10b981" />
                                ) : (
                                    <button onClick={() => removeFile(fileObj.id)} disabled={loading} style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.6)', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                    <button className="btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className="btn-primary"
                        disabled={files.length === 0 || loading}
                        onClick={handleFinalUpload}
                        style={{ opacity: (files.length === 0 || loading) ? 0.6 : 1 }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : `Upload ${files.length} ${files.length === 1 ? 'Asset' : 'Assets'}`}
                    </button>
                </div>
            </div>
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

export default UploadModal;

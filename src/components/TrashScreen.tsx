import React, { useState } from 'react';
import {
    Trash2,
    Trash,
    RotateCcw,
    AlertCircle,
    Loader2
} from 'lucide-react';
import FileIcon from './FileIcon';

import { useFiles } from '../context/FileContext';
import { useEffect } from 'react';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';

const TrashScreen: React.FC = () => {
    const { trashItems, loading, fetchTrashFiles, restoreItem, emptyTrash, deleteItem } = useFiles();

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
        type: 'question',
        confirmOnly: false
    });

    useEffect(() => {
        fetchTrashFiles();
    }, []);

    const handleEmptyTrash = () => {
        if (trashItems.length === 0) return;

        setConfirmModal({
            isOpen: true,
            title: 'Empty Trash',
            description: 'Are you sure you want to permanently delete all items in the trash? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Empty Trash',
            onConfirm: async () => {
                await emptyTrash();
                // alert("Trash emptied."); // Optional feedback
            }
        });
    };

    const handleRestore = async (id: string) => {
        await restoreItem(id);
    };

    const handleDeletePermanent = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Permanently',
            description: 'Permanently delete this file? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                await deleteItem(id, true);
            }
        });
    };

    const formatDeletedAt = (dateString?: string) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    return (
        <div className="main-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Trash {loading && <Loader2 className="animate-spin inline-block ml-2" size={16} />}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Recover deleted documents or empty the trash.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn-outline"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', opacity: trashItems.length === 0 ? 0.5 : 1, cursor: trashItems.length === 0 ? 'not-allowed' : 'pointer', padding: '8px 16px', fontSize: '0.85rem' }}
                        onClick={handleEmptyTrash}
                        disabled={trashItems.length === 0}
                    >
                        <Trash2 size={16} />
                        <span style={{ marginLeft: '8px' }}>Empty Trash</span>
                    </button>
                </div>
            </header>

            <div className="glass-card" style={{
                padding: '20px',
                marginBottom: '32px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px dashed rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <AlertCircle size={20} color="#ef4444" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    Files in the trash will be permanently deleted after <span style={{ fontWeight: 700 }}>30 days</span>.
                </span>
            </div>

            <div className="glass-card" style={{ padding: '0 24px' }}>
                {trashItems.length > 0 ? (
                    <div className="responsive-table">
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '16px 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Name</th>
                                    <th style={{ padding: '16px 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Size</th>
                                    <th style={{ padding: '16px 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Deleted At</th>
                                    <th style={{ padding: '16px 0', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trashItems.map((file) => (
                                    <tr key={file.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '16px 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <FileIcon name={file.name} size={20} />
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 500 }}>{file.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{file.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{file.size}</td>
                                        <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{formatDeletedAt(file.deleted_at)}</td>
                                        <td style={{ padding: '16px 0', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="glass-card"
                                                    style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                                    title="Restore"
                                                    onClick={() => handleRestore(file.id)}
                                                >
                                                    <RotateCcw size={16} color="var(--umat-green)" />
                                                </button>
                                                <button
                                                    className="glass-card"
                                                    style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                                    title="Permanently Delete"
                                                    onClick={() => handleDeletePermanent(file.id)}
                                                >
                                                    <Trash size={16} color="#ef4444" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                        <Trash2 size={48} color="var(--glass-border)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: 'var(--text-muted)' }}>Trash is empty</h3>
                    </div>
                )}
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

export default TrashScreen;

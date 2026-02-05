import React, { useState, useEffect } from 'react';
import {
    X,
    Share2,
    Download,
    History,
    MessageSquare,
    Shield,
    QrCode,
    Trash2,
    Plus,
    Check,
    Users,
    User,
    Lock,
    Send,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import type { FileItem } from '../context/FileContext';

import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useFiles } from '../context/FileContext';
import FileIcon from './FileIcon';
import FilePreview from './FilePreview';
import { supabase, logAction } from '../lib/supabase';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';

interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    file_id?: string;
    parent_id?: string | null;
    profiles?: {
        full_name: string;
        email: string;
    };
}

interface FileDetailViewProps {
    file: FileItem;
    onBack: () => void;
}

interface FileVersion {
    id: string;
    version_number: number;
    name: string;
    size: string;
    created_at: string;
    uploaded_by: string;
    profiles?: { full_name: string };
}

const FileDetailView: React.FC<FileDetailViewProps> = ({ file, onBack }) => {
    const { user, profile } = useAuth();
    const { createNotification } = useNotifications();
    const { deleteItem } = useFiles();
    const isAdmin = profile?.role === 'Admin';
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [visibility, setVisibility] = useState<'everyone' | 'specific' | 'private'>(file?.visibility || 'everyone');
    const [userSearch, setUserSearch] = useState('');
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

    // Versioning State
    const [versions, setVersions] = useState<FileVersion[]>([]);
    const [uploadingVersion, setUploadingVersion] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        if (file) {
            fetchComments();
            fetchVersions();
            setVisibility(file.visibility || 'everyone');

            // Realtime subscriptions
            const channel = supabase
                .channel(`file-details:${file.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'comments',
                        filter: `file_id=eq.${file.id}`
                    },
                    (payload) => {
                        console.log('Comment change detected:', payload);
                        fetchComments();
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'file_versions',
                        filter: `file_id=eq.${file.id}`
                    },
                    (payload) => {
                        console.log('Version change detected:', payload);
                        fetchVersions();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [file]);

    useEffect(() => {
        if (isSharing) {
            fetchProfiles();
        }
    }, [isSharing]);

    const fetchVersions = async () => {
        const { data } = await supabase.from('file_versions')
            .select('*, profiles(full_name)')
            .eq('file_id', file.id)
            .order('version_number', { ascending: false });
        if (data) setVersions(data as any);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFile = e.target.files?.[0];
        if (!newFile || !user) return;

        setUploadingVersion(true);
        try {
            // 1. Determine next version number
            const { count } = await supabase.from('file_versions').select('*', { count: 'exact', head: true }).eq('file_id', file.id);
            const nextVersion = (count || 0) + 1;

            // 2. Archive current file to versions
            if (!file.storage_path) {
                // If existing file doesn't have storage_path in DB, we can't archive cleanly?
                // Or maybe we skip archiving storage path and just metadata?
                // Let's assume most files have storage_path. If not, we might error.
                // We'll proceed but log warning.
                console.warn("No storage path for current file. Version will lack file reference.");
            }

            const { error: versionError } = await supabase.from('file_versions').insert({
                file_id: file.id,
                version_number: nextVersion,
                name: file.name,
                storage_path: file.storage_path || '', // Fallback
                size: file.size,
                uploaded_by: file.user_id, // Original/Previous uploader
                change_summary: 'Archived before new version upload'
            });

            if (versionError) throw versionError;

            // 3. Upload NEW file to storage
            // Use same logic as uploadFile context: clean name, folder structure
            const fileExt = newFile.name.split('.').pop();
            const fileName = `${user.id}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('files')
                .upload(fileName, newFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(fileName);
            const sizeString = newFile.size < 1024 * 1024
                ? `${(newFile.size / 1024).toFixed(2)} KB`
                : `${(newFile.size / (1024 * 1024)).toFixed(2)} MB`;

            // 4. Update 'files' table
            // We maintain the SAME record ID, just update content pointers
            const { error: updateError } = await supabase.from('files').update({
                name: newFile.name,
                size: sizeString,
                storage_path: fileName,
                url: publicUrl,
                updated_at: new Date().toISOString(),
                // Note: user_id (Owner) stays same. 
            }).eq('id', file.id);

            if (updateError) throw updateError;

            // Log Action
            await logAction(
                user.id,
                'VERSION_UPLOAD',
                'File',
                file.id,
                { version: nextVersion, file_name: file.name }
            );

            // Notify User
            await createNotification(
                user.id,
                'Version Updated',
                `New version (v${nextVersion}.0) of "${file.name}" has been successfully committed.`,
                'file'
            );

            // Notify Owner if different
            if (file.user_id !== user.id) {
                await createNotification(
                    file.user_id,
                    'File Version Updated',
                    `${profile?.full_name || 'A user'} updated a new version (v${nextVersion}.0) of your file "${file.name}".`,
                    'file'
                );
            }

            // Notify Shared Users
            if (file.visibility === 'specific' && file.shared_with && file.shared_with.length > 0) {
                const recipients = file.shared_with.filter((id: string) => id !== user.id && id !== file.user_id);
                for (const recipientId of recipients) {
                    await createNotification(
                        recipientId,
                        'File Version Updated',
                        `${profile?.full_name || 'A user'} updated a new version (v${nextVersion}.0) of shared file "${file.name}".`,
                        'file'
                    );
                }
            }

            setConfirmModal({
                isOpen: true,
                title: 'Version Synchronized',
                description: 'A new iteration of this document has been committed to the institutional repository.',
                type: 'success',
                confirmText: 'Done',
                confirmOnly: true,
                onConfirm: onBack
            });
        } catch (err: any) {
            console.error(err);
            setConfirmModal({
                isOpen: true,
                title: 'Commit Failed',
                description: `Failed to upload the new iteration: ${err.message || 'Check connection'}`,
                type: 'danger',
                confirmText: 'Close',
                confirmOnly: true,
                onConfirm: () => { }
            });
        } finally {
            setUploadingVersion(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRestoreVersion = async (version: FileVersion) => {
        if (!user) return;

        setConfirmModal({
            isOpen: true,
            title: 'Restore Version',
            description: `Are you sure you want to restore v${version.version_number}.0? The current version will be archived.`,
            type: 'warning',
            confirmText: 'Restore',
            onConfirm: async () => {
                try {
                    // 1. Archive CURRENT file state as a new version (to prevent data loss)
                    const { count } = await supabase.from('file_versions').select('*', { count: 'exact', head: true }).eq('file_id', file.id);
                    const nextVersion = (count || 0) + 1;

                    await supabase.from('file_versions').insert({
                        file_id: file.id,
                        version_number: nextVersion,
                        name: file.name,
                        storage_path: file.storage_path || '',
                        size: file.size,
                        uploaded_by: file.user_id,
                        change_summary: 'Archived before restoration'
                    });

                    // 2. Update 'files' table with the OLD version's data
                    // We need to fetch the version's full details? We have them in `version` object?
                    // `FileVersion` interface has `name`, `size`. Does it have `storage_path` and `url`?
                    // My previous interface def (line 48) missed `storage_path`.
                    // But `fetchVersions` selects `*`, so it IS there in runtime.
                    // I should cast or update interface. For now, assuming it's available.
                    // Wait, `FileVersion` interface in line 48:
                    // interface FileVersion { ... id, version_number, name, size ... }
                    // I need to update interface too or verify `fetchVersions` select.
                    // `fetchVersions` does `.select('*, ...')`. So fields exist.

                    const versionData = version as any; // Cast to access extra fields

                    const { error } = await supabase.from('files').update({
                        name: versionData.name,
                        size: versionData.size,
                        storage_path: versionData.storage_path,
                        // We might need to regenerate URL if tokens expire, but public buckets usually static.
                        // However, storage_path is key.
                        // URL might need fetching again?
                        // let's fetch public url for that storage_path just in case?
                        // Or if `versionData.url` exists? (Usually not stored in version table? schema not shown).
                        // If `version` table stores `storage_path`, we can derive URL.
                    }).eq('id', file.id);

                    if (error) throw error;

                    // Re-calculate URL if needed (optional but safe)
                    if (versionData.storage_path) {
                        const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(versionData.storage_path);
                        await supabase.from('files').update({ url: publicUrl }).eq('id', file.id);
                    }

                    // Log Action
                    await logAction(
                        user.id,
                        'VERSION_RESTORE',
                        'File',
                        file.id,
                        { restored_version: version.version_number, file_name: file.name }
                    );

                    // Notify User
                    await createNotification(
                        user.id,
                        'Version Restored',
                        `File "${file.name}" has been restored to v${version.version_number}.0.`,
                        'file'
                    );

                    // Notify Owner if different
                    if (file.user_id !== user.id) {
                        await createNotification(
                            file.user_id,
                            'File Version Restored',
                            `${profile?.full_name || 'A user'} restored "${file.name}" to version v${version.version_number}.0.`,
                            'file'
                        );
                    }

                    // Notify Shared Users
                    if (file.visibility === 'specific' && file.shared_with && file.shared_with.length > 0) {
                        const recipients = file.shared_with.filter((id: string) => id !== user.id && id !== file.user_id);
                        for (const recipientId of recipients) {
                            await createNotification(
                                recipientId,
                                'File Version Restored',
                                `${profile?.full_name || 'A user'} restored shared file "${file.name}" to v${version.version_number}.0.`,
                                'file'
                            );
                        }
                    }

                    setConfirmModal({
                        isOpen: true,
                        title: 'Restoration Complete',
                        description: `Role-back successful. The document is now reverted to v${version.version_number}.0.`,
                        type: 'success',
                        confirmText: 'Done',
                        confirmOnly: true,
                        onConfirm: () => { }
                    });

                    // onBack(); // Optional: close or stay? Stay is better to see change.
                } catch (err: any) {
                    console.error(err);
                    setConfirmModal({
                        isOpen: true,
                        title: 'Restoration Failed',
                        description: `Failed to restore version: ${err.message}`,
                        type: 'danger',
                        confirmText: 'Close',
                        confirmOnly: true,
                        onConfirm: () => { }
                    });
                }
            }
        });
    };

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .neq('id', user?.id || '')
                .order('full_name');

            if (error) throw error;
            if (data) setAvailableUsers(data);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    const fetchComments = async () => {
        if (!file) return;
        setLoadingComments(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*, profiles(full_name, email)')
                .eq('file_id', file.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                setComments(data as any);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const filteredUsers = availableUsers.filter(u =>
        u.full_name.toLowerCase().includes(userSearch.toLowerCase()) && !selectedUsers.includes(u.id)
    );

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(u => u !== userId) : [...prev, userId]
        );
    };

    const handleDownload = () => {
        if (!file?.url) return;
        window.open(file.url, '_blank');
    };

    const handleShare = () => {
        setIsSharing(true);
    };

    const handleConfirmShare = async () => {
        if (visibility === 'specific' && selectedUsers.length === 0) {
            setConfirmModal({
                isOpen: true,
                title: 'Selection Required',
                description: 'Please select at least one institutional user to grant specific access.',
                type: 'warning',
                confirmText: 'Select Users',
                confirmOnly: true,
                onConfirm: () => { }
            });
            return;
        }

        try {
            const { error } = await supabase
                .from('files')
                .update({
                    visibility: visibility,
                    shared_with: visibility === 'specific' ? selectedUsers : []
                })
                .eq('id', file.id);

            if (error) throw error;

            const visibilityMsgs = {
                everyone: "everyone in the board",
                specific: `selected individuals`,
                private: "yourself (Private Vault)"
            };

            setConfirmModal({
                isOpen: true,
                title: 'Accessibility Updated',
                description: `Permissions sync complete. This asset is now visible to ${visibilityMsgs[visibility]}.`,
                type: 'success',
                confirmText: 'Continue',
                confirmOnly: true,
                onConfirm: () => { }
            });
            setIsSharing(false);
        } catch (error: any) {
            console.error('Error updating sharing settings:', error);
            setConfirmModal({
                isOpen: true,
                title: 'Sync Failed',
                description: `Failed to update access controls: ${error.message || 'Check connection'}`,
                type: 'danger',
                confirmText: 'Close',
                confirmOnly: true,
                onConfirm: () => { }
            });
        }
    };

    const handleDelete = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Permanently',
            description: 'Are you sure you want to permanently delete this file? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await deleteItem(file.id, true);
                    onBack();
                } catch (err: any) {
                    console.error(err);
                    setConfirmModal({
                        isOpen: true,
                        title: 'Purge Failed',
                        description: `Failed to permanently deletes this asset: ${err.message || 'Check connection'}`,
                        type: 'danger',
                        confirmText: 'Close',
                        confirmOnly: true,
                        onConfirm: () => { }
                    });
                }
            }
        });
    };

    const handleAddComment = async (e?: React.FormEvent, parentId: string | null = null) => {
        if (e) e.preventDefault();

        const content = parentId ? replyText : commentText;
        if (!content.trim() || !user || !file) return;

        try {
            // Optimistic update or refresh?
            const { data, error } = await supabase
                .from('comments')
                .insert([{
                    file_id: file.id,
                    user_id: user.id,
                    content: content,
                    parent_id: parentId
                }])
                .select('*, profiles(full_name, email)')
                .single();

            if (error) throw error;

            if (data) {
                setComments(prev => [data as any, ...prev]);

                // Notify (Mock logic moved to Supabase trigger ideally, or keep here)
                let notifUserId = file.user_id;
                let notifTitle = 'New Comment on File';
                let notifMsg = `${profile?.full_name || 'A board member'} commented on your file "${file.name}".`;

                if (parentId) {
                    const parentComment = comments.find(c => c.id === parentId);
                    if (parentComment) {
                        notifUserId = parentComment.user_id;
                        notifTitle = 'New Reply to your Comment';
                        notifMsg = `${profile?.full_name || 'A board member'} replied to your comment on "${file.name}".`;
                    }
                }

                if (notifUserId !== user.id) {
                    await createNotification(
                        notifUserId,
                        notifTitle,
                        notifMsg,
                        'comment'
                    );
                }
            }

            if (parentId) {
                setReplyText('');
                setReplyingTo(null);
            } else {
                setCommentText('');
            }
        } catch (error: any) {
            console.error('Error adding comment:', error);
            setConfirmModal({
                isOpen: true,
                title: 'Remark Failed',
                description: `Failed to post your remark: ${error.message || 'Check connection'}`,
                type: 'danger',
                confirmText: 'Close',
                confirmOnly: true,
                onConfirm: () => { }
            });
        }
    };

    const visibilityOptions = [
        { id: 'everyone', label: 'Everyone', icon: <Users size={16} /> },
        { id: 'specific', label: 'Specific', icon: <User size={16} /> },
        { id: 'private', label: 'Only Me', icon: <Lock size={16} /> },
    ];

    const renderCommentNode = (comment: Comment, depth: number = 0) => {
        const initials = comment.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??';
        const isReply = depth > 0;

        return (
            <div key={comment.id} style={{ marginBottom: '12px', marginLeft: `${depth * 24}px` }}> {/* Dynamic margin based on depth */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--umat-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 700, flexShrink: 0, scale: isReply ? '0.9' : '1' }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{comment.profiles?.full_name || 'Anonymous'}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{comment.content}</p>

                        <div style={{ marginTop: '4px' }}>
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.75rem', color: 'var(--umat-green)', cursor: 'pointer', fontWeight: 600 }}
                            >
                                {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                            </button>
                        </div>

                        {replyingTo === comment.id && (
                            <form
                                onSubmit={(e) => handleAddComment(e, comment.id)}
                                style={{ marginTop: '8px', display: 'flex', gap: '8px' }}
                            >
                                <input
                                    type="text"
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    autoFocus
                                    style={{ flex: 1, background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '6px 10px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '0.8rem' }}
                                />
                                <button
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    style={{ background: 'var(--umat-green)', border: 'none', color: 'white', padding: '6px 10px', borderRadius: '8px', cursor: replyText.trim() ? 'pointer' : 'default', fontSize: '0.75rem' }}
                                >
                                    Reply
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderCommentsList = () => {
        if (loadingComments && comments.length === 0) {
            return <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" size={24} color="var(--umat-gold)" /></div>;
        }

        if (comments.length === 0) {
            return <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No remarks yet. Start the conversation.</div>;
        }

        // Helper to recursively render threads
        const renderThread = (comment: Comment, depth: number) => {
            // Find children
            const replies = comments
                .filter(c => c.parent_id === comment.id)
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            return (
                <div key={comment.id}>
                    {renderCommentNode(comment, depth)}
                    {replies.map(reply => renderThread(reply, depth + 1))}
                </div>
            );
        };

        const rootComments = comments
            .filter(c => !c.parent_id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return (
            <div>
                {rootComments.map(root => renderThread(root, 0))}
            </div>
        );
    };

    return (
        <div className="main-content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    className="shadow-hover"
                    style={{
                        background: 'var(--glass)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-main)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>File Details</h1>
            </div>

            <div
                className="glass-card"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 340px',
                    height: 'calc(100vh - 120px)',
                    overflow: 'hidden'
                }}
            >
                {/* Main Content / Preview */}
                <div style={{ padding: '40px', overflowY: 'auto', borderRight: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '12px', background: 'rgba(0, 104, 55, 0.1)', borderRadius: '12px' }}>
                                <FileIcon name={file.name} size={32} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{file.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        {file.type === 'file' ? 'File' : 'Folder'} • {file.size || '--'} •
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={file.uploader_name}>
                                            Updated by
                                            {file.uploader_avatar && (
                                                <img
                                                    src={file.uploader_avatar}
                                                    alt={file.uploader_name}
                                                    style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            )}
                                            <strong style={{ fontWeight: 600 }}>{file.uploader_name}</strong>
                                        </span>
                                        • {file.updated_at ? new Date(file.updated_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <span
                                        onClick={() => setIsSharing(true)}
                                        style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            background: 'rgba(0, 104, 55, 0.1)',
                                            color: 'var(--umat-green)',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--umat-green)' }} />
                                        {visibility}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <FilePreview file={file} onDownload={handleDownload} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 0.8fr', gap: '20px' }}>
                        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={16} color="var(--umat-gold)" /> Institutional Comments
                            </h3>

                            {/* Comment Input */}
                            <form
                                onSubmit={(e) => handleAddComment(e)}
                                style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}
                            >
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Add a professional remark..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        style={{ flex: 1, background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '10px 14px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', cursor: 'text' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        style={{ background: 'var(--umat-green)', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: commentText.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: commentText.trim() ? 1 : 0.5 }}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>

                            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                                {renderCommentsList()}
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <History size={16} color="var(--umat-gold)" /> Version History
                                </span>
                                {(isAdmin || file.user_id === user?.id) && (
                                    <>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingVersion}
                                            style={{ background: 'none', border: 'none', color: 'var(--umat-green)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                        >
                                            {uploadingVersion ? 'Uploading...' : '+ New Version'}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleFileUpload}
                                        />
                                    </>
                                )}
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <p style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', fontWeight: 600 }}>
                                    <span>v{(versions.length || 0) + 1}.0 (Current)</span>
                                    <span>Today</span>
                                </p>

                                {versions.map(v => (
                                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 500 }}>v{v.version_number}.0</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem' }}>{new Date(v.created_at).toLocaleDateString()}</p>
                                        </div>
                                        {(isAdmin || file.user_id === user?.id) && (
                                            <button
                                                onClick={() => handleRestoreVersion(v)}
                                                style={{
                                                    background: 'rgba(0, 104, 55, 0.1)',
                                                    border: 'none',
                                                    color: 'var(--umat-green)',
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Restore
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {versions.length === 0 && (
                                    <p style={{ fontStyle: 'italic', fontSize: '0.75rem', opacity: 0.7 }}>No previous versions</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <aside style={{ padding: '40px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '24px', letterSpacing: '1px' }}>
                        Quick Actions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {!isSharing ? (
                            <>
                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDownload}>
                                    <Download size={18} style={{ marginRight: '8px' }} /> Download File
                                </button>
                                <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={handleShare}>
                                    <Share2 size={18} style={{ marginRight: '8px' }} /> Update Accessibility
                                </button>
                            </>
                        ) : (
                            <div className="glass-card" style={{ padding: '20px', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid var(--umat-gold)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Access Control</h4>
                                    <X size={16} onClick={() => setIsSharing(false)} style={{ cursor: 'pointer' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                                    {visibilityOptions.map(opt => (
                                        <div
                                            key={opt.id}
                                            onClick={() => setVisibility(opt.id as any)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 4px',
                                                borderRadius: '8px',
                                                background: visibility === opt.id ? 'var(--umat-green)' : 'var(--glass)',
                                                border: '1px solid var(--glass-border)',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ color: visibility === opt.id ? 'white' : 'var(--text-muted)' }}>
                                                {opt.icon}
                                            </div>
                                            <p style={{ fontSize: '0.65rem', fontWeight: 600, margin: '4px 0 0 0', color: visibility === opt.id ? 'white' : 'var(--text-muted)' }}>{opt.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {visibility === 'specific' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '8px', color: 'var(--text-main)', marginBottom: '12px', outline: 'none', fontSize: '0.85rem', cursor: 'text' }}
                                        />
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: (selectedUsers.length > 0 ? '12px' : '0') }}>
                                            {selectedUsers.map(uid => {
                                                const u = availableUsers.find(au => au.id === uid);
                                                return (
                                                    <span key={uid} style={{ padding: '2px 8px', borderRadius: '15px', background: 'var(--umat-green)', fontSize: '0.7rem', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        {u ? u.full_name.split(' ')[0] : 'Unknown'} <X size={10} onClick={() => toggleUser(uid)} style={{ cursor: 'pointer' }} />
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        {userSearch && (
                                            <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '16px' }}>
                                                {filteredUsers.map(user => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => toggleUser(user.id)}
                                                        style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass)', marginBottom: '4px' }}
                                                    >
                                                        <div style={{ overflow: 'hidden' }}>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.full_name}</p>
                                                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user.role}</p>
                                                        </div>
                                                        <Plus size={12} color="var(--umat-gold)" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', marginTop: '12px' }}
                                    onClick={handleConfirmShare}
                                >
                                    <Check size={16} style={{ marginRight: '8px' }} /> Update Access
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '32px 0' }} />

                    <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '24px', letterSpacing: '1px' }}>
                        Institutional Access
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <QrCode size={48} color="black" style={{ border: '4px solid white', borderRadius: '4px', background: 'white' }} />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>Scan for Access</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure internal link</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setIsSharing(true)}
                            style={{
                                background: 'var(--glass)',
                                padding: '16px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                border: '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="shadow-hover"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--umat-green)' }}>
                                <Shield size={14} />
                                <span style={{ fontWeight: 700 }}>Security Level</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Current Visibility: <strong style={{ color: 'var(--umat-gold)' }}>{visibility.toUpperCase()}</strong></span>
                                <Share2 size={12} />
                            </p>
                        </div>
                    </div>

                    {(isAdmin || file.user_id === user?.id) && (
                        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                            <button
                                onClick={handleDelete}
                                style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <Trash2 size={16} /> Delete Permanentely
                            </button>
                        </div>
                    )}
                </aside>
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

export default FileDetailView;

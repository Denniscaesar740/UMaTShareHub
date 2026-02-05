import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    Users,
    Clock,
    Filter,
    Edit3,
    Trash2,
    Loader2
} from 'lucide-react';
import UserFormModal from './UserFormModal';
import { supabase, logAction } from '../lib/supabase';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';

const UserManagement: React.FC = () => {
    const [userList, setUserList] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const { createNotification } = useNotifications();
    const { profile: adminProfile } = useAuth();
    const [loading, setLoading] = useState(true);

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

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Real Profiles
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (profileError) throw profileError;

            // 2. Fetch Pending Invites
            const { data: invites, error: inviteError } = await supabase
                .from('user_invites')
                .select('*');

            // Ignore invite error if table doesn't exist yet (migration pending)
            const safeInvites = (inviteError ? [] : invites) || [];

            // 3. Merge
            const formattedInvites = safeInvites.map(inv => ({
                id: `invite-${inv.email}`, // Temporary ID
                full_name: inv.email, // Use email as name for invites
                email: inv.email,
                department: inv.department || 'Pending Join',
                role: inv.role,
                status: 'Invited',
                last_active: null,
                is_invite: true // Flag to identify
            }));

            if (profiles) {
                setUserList([...profiles, ...formattedInvites]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Subscription for realtime updates
        const channel = supabase
            .channel('profiles_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const formatLastActive = (dateString: string | null) => {
        if (!dateString) return 'Never';
        const now = new Date();
        const lastActive = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - lastActive.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return lastActive.toLocaleDateString();
    };

    const stats = [
        { label: 'Active Members', value: userList.filter(u => u.status === 'Active').length, icon: Users, color: 'var(--umat-navy)' },
        {
            label: 'Active Now',
            value: userList.filter(u => {
                if (!u.last_active) return false;
                const diff = (new Date().getTime() - new Date(u.last_active).getTime()) / 1000;
                return diff < 300; // 5 minutes
            }).length,
            icon: Clock,
            color: 'var(--umat-green)'
        },
        {
            label: 'Pending Approvals',
            value: userList.filter(u => u.status === 'Pending').length,
            icon: Loader2,
            color: '#fbbf24'
        }
    ];

    const filteredUsers = userList.filter(user => {
        const matchesSearch =
            (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.department || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Revoke Access',
            description: `Are you sure you want to revoke institutional access for ${name}?`,
            type: 'danger',
            confirmText: 'Revoke Access',
            onConfirm: async () => {
                try {
                    // Check if it's an invite by ID prefix or helper function
                    const isInvite = id.startsWith('invite-');

                    if (isInvite) {
                        // Delete Invite
                        const email = id.replace('invite-', '');
                        const { error } = await supabase.from('user_invites').delete().eq('email', email);
                        if (error) throw error;
                        setConfirmModal({
                            isOpen: true,
                            title: 'Invitation Cancelled',
                            description: `The invitation for ${email} has been successfully withdrawn.`,
                            type: 'success',
                            confirmText: 'Done',
                            confirmOnly: true,
                            onConfirm: fetchData
                        });
                    } else {
                        // Revoke Profile Access
                        const { error } = await supabase
                            .from('profiles')
                            .update({ status: 'Inactive' })
                            .eq('id', id);

                        if (error) throw error;

                        if (adminProfile) {
                            // Log the action
                            await logAction(
                                adminProfile.id,
                                'ACCESS_REVOKED',
                                'user',
                                id,
                                { revoked_user: name, timestamp: new Date().toISOString() }
                            );

                            await createNotification(
                                adminProfile.id,
                                'Access Revoked',
                                `Institutional access for ${name} has been suspended.`,
                                'warning'
                            );
                        }
                    }
                    fetchData();
                } catch (err: any) {
                    console.error("Error revoking access:", err);
                    setConfirmModal({
                        isOpen: true,
                        title: 'Operation Failed',
                        description: `Failed to revoke institutional access: ${err.message || 'Check connection'}`,
                        type: 'danger',
                        confirmText: 'Close',
                        confirmOnly: true,
                        onConfirm: () => { }
                    });
                }
            }
        });
    };

    const handleApproveUser = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Approve Access',
            description: `Approve access for ${name}? They will gain full access to assigned resources.`,
            type: 'success',
            confirmText: 'Approve',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ status: 'Active' })
                        .eq('id', id);

                    if (error) throw error;

                    // Log the action
                    if (adminProfile) {
                        await logAction(
                            adminProfile.id,
                            'USER_APPROVAL',
                            'user',
                            id,
                            { approved_user: name, timestamp: new Date().toISOString() }
                        );
                    }

                    // Notify the user
                    await createNotification(
                        id,
                        'Institutional Access Approved',
                        'Your application for the UMaT Board Portal has been approved. You now have full access to your assigned resources.',
                        'success'
                    );

                    // Notify admin self-audit (optional but good for feedback)
                    if (adminProfile) {
                        await createNotification(
                            adminProfile.id,
                            'Member Approved',
                            `${name} has been successfully authorized.`,
                            'info'
                        );
                    }

                    setConfirmModal({
                        isOpen: true,
                        title: 'Member Approved',
                        description: `${name} has been successfully authorized and granted access.`,
                        type: 'success',
                        confirmText: 'Perfect',
                        confirmOnly: true,
                        onConfirm: fetchData
                    });
                } catch (err: any) {
                    console.error("Error approving user:", err);
                    setConfirmModal({
                        isOpen: true,
                        title: 'Approval Error',
                        description: `Failed to approve member: ${err.message || 'Check RLS policies'}`,
                        type: 'danger',
                        confirmText: 'Close',
                        confirmOnly: true,
                        onConfirm: () => { }
                    });
                }
            }
        });
    };

    const handleFormSubmit = async (userData: any) => {
        setLoading(true);
        try {
            if (selectedUser && !selectedUser.is_invite) {
                // Update existing profile
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: userData.name,
                        role: userData.role,
                        department: userData.department,
                        status: userData.status
                    })
                    .eq('id', selectedUser.id);

                if (error) throw error;
                setConfirmModal({
                    isOpen: true,
                    title: 'Profile Updated',
                    description: 'Member profile details have been successfully synchronized.',
                    type: 'success',
                    confirmText: 'Return',
                    confirmOnly: true,
                    onConfirm: fetchData
                });
            } else {
                // Add New = Create Invite
                // Also handles updating an existing invite if selectedUser.is_invite is true
                const targetEmail = selectedUser?.is_invite ? selectedUser.email : userData.email;

                // Upsert invite
                const { error } = await supabase
                    .from('user_invites')
                    .upsert([{
                        email: targetEmail,
                        role: userData.role,
                        department: userData.department,
                        invited_by: adminProfile?.id
                    }], { onConflict: 'email' });

                if (error) throw error;
                setConfirmModal({
                    isOpen: true,
                    title: 'Invitation Managed',
                    description: `Invitation ${selectedUser?.is_invite ? 'updated' : 'sent'} to ${targetEmail} successfully.`,
                    type: 'success',
                    confirmText: 'Done',
                    confirmOnly: true,
                    onConfirm: fetchData
                });
            }
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setConfirmModal({
                isOpen: true,
                title: 'Operation Failed',
                description: `Failed to sync profile change: ${err.message || 'Check connection'}`,
                type: 'danger',
                confirmText: 'Close',
                confirmOnly: true,
                onConfirm: () => { }
            });
        } finally {
            setLoading(false);
            fetchData();
        }
    };

    return (
        <div className="main-content">
            <header className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Access Control</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Security and role management for the Board Portal.</p>
                </div>
                <button className="btn-primary" onClick={handleAddUser} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    <UserPlus size={18} />
                    <span style={{ marginLeft: '8px' }}>Authorize New Member</span>
                </button>
            </header>

            {/* Stats Overview */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={24} color={stat.color} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</p>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card search-filter-row" style={{ padding: '16px 20px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, width: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search institutional directory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'var(--bg-dark)',
                            border: '1px solid var(--glass-border)',
                            padding: '10px 12px 10px 40px',
                            borderRadius: '10px',
                            color: 'var(--text-main)',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '200px' }}>
                    <Filter size={18} color="var(--text-muted)" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '10px 16px', borderRadius: '10px', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Board Member</option>
                        <option>Viewer</option>
                        <option>Guest</option>
                    </select>
                </div>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>User Directory</h3>
                </div>
                <div className="responsive-table">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.01)' }}>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Profile</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Dept / Unit</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Security Role</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Activity</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px 24px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="user-row" style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.full_name}
                                                    style={{
                                                        width: '42px',
                                                        height: '42px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '42px',
                                                    height: '42px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--umat-navy), var(--umat-green))',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1rem',
                                                    fontWeight: 800,
                                                    color: 'var(--umat-gold)',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                                }}>
                                                    {(user.full_name || 'U').split(' ').pop()?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{user.full_name}</p>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.9 }}>{user.department}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            background: user.role === 'Admin' ? 'rgba(0, 104, 55, 0.1)' : 'rgba(0, 45, 98, 0.1)',
                                            color: user.role === 'Admin' ? 'var(--umat-green)' : 'var(--umat-navy)',
                                            border: `1px solid ${user.role === 'Admin' ? 'var(--umat-green)' : 'var(--umat-navy)'}30`
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--umat-gold)', fontWeight: 500 }}>
                                        {formatLastActive(user.last_active)}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.status === 'Active' ? '#10b981' : (user.status === 'Pending' || user.status === 'Invited' ? '#fbbf24' : '#ef4444') }}></div>
                                            <span style={{ color: user.status === 'Active' ? '#10b981' : (user.status === 'Pending' || user.status === 'Invited' ? '#fbbf24' : '#ef4444'), fontWeight: 600 }}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                            {user.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleApproveUser(user.id, user.full_name)}
                                                    style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                                                    className="action-btn"
                                                    title="Approve User"
                                                >
                                                    <Users size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                                                className="action-btn"
                                                title="Edit Profile"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.full_name)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                                                className="action-btn"
                                                title="Revoke Access"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--umat-gold)" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                                        <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <Search size={40} opacity={0.3} />
                                            No members matching your search parameters were found in the institutional directory.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedUser}
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

            <style>
                {`
                    .user-row:hover {
                        background: rgba(255, 255, 255, 0.02);
                    }
                    .action-btn:hover {
                        background: var(--glass-border);
                        color: var(--text-main) !important;
                    }
                    @media (max-width: 768px) {
                        .header-flex {
                            flex-direction: column;
                            align-items: flex-start !important;
                        }
                        .header-flex .btn-primary {
                            width: 100%;
                            justify-content: center;
                        }
                        .search-filter-row {
                            flex-direction: column;
                            align-items: stretch !important;
                        }
                        .search-filter-row > div {
                            max-width: 100% !important;
                        }
                        .stats-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default UserManagement;

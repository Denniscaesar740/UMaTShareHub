import React from 'react';
import {
    X,
    Search,
    Filter,
    Download,
    Settings,
    Clock,
    User,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface AuditTrailModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && user) {
            fetchLogs();
        }
    }, [isOpen, user]);

    const fetchLogs = async () => {
        if (!user) return;

        try {
            const isAdmin = (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role === 'Admin';

            let query = supabase
                .from('audit_logs')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!isAdmin) {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;
            if (error) throw error;

            if (data) {
                setAuditLogs(data.map((log: any) => ({
                    id: log.id,
                    action: log.action,
                    detail: log.details?.filename || log.details?.reason || log.entity_type || 'System Action',
                    user: log.profiles?.full_name || log.profiles?.email || 'System',
                    ip: log.details?.ip || 'Institutional Network',
                    time: new Date(log.created_at).toLocaleString(),
                    status: 'success'
                })));
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        }
    };

    useEffect(() => {
        if (!isOpen || !user) return;

        fetchLogs();

        const channel = supabase
            .channel('audit-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs' },
                () => fetchLogs()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, user]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(15px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 6000,
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <div
                className="glass-card"
                style={{
                    width: '95%',
                    maxWidth: '1100px',
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUp 0.4s ease-out',
                    background: 'var(--bg-modal)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header style={{ padding: '32px 40px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Institutional Audit Trail</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Security and activity logs for account <strong>{user?.email}</strong></p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={18} /> Export CSV
                        </button>
                        <button onClick={onClose} style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer', padding: '10px', borderRadius: '50%' }}>
                            <X size={24} />
                        </button>
                    </div>
                </header>

                {/* Toolbar */}
                <div style={{ padding: '20px 40px', background: 'var(--glass)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search logs by action or detail..."
                            style={{ width: '400px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', padding: '10px 12px 10px 40px', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}><Filter size={16} style={{ marginRight: '8px' }} /> Filter By Type</button>
                        <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}><Clock size={16} style={{ marginRight: '8px' }} /> Last 30 Days</button>
                    </div>
                </div>

                {/* Content Table */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <th style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>Status</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>Action</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>Detail</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>Location / IP</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="hover-row">
                                    <td style={{ padding: '16px' }}>
                                        {log.status === 'success' ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Settings size={14} color="var(--umat-gold)" />
                                            <span style={{ fontWeight: 600 }}>{log.action}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-main)', fontSize: '0.9rem' }}>{log.detail}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <User size={12} /> {log.ip}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--umat-gold)', fontSize: '0.85rem', fontWeight: 500 }}>{log.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{ padding: '24px 40px', background: 'var(--glass)', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {auditLogs.length} historical events</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-outline" style={{ padding: '6px 12px' }}>Previous</button>
                        <button className="btn-outline" style={{ padding: '6px 12px', background: 'var(--glass-border)' }}>Next</button>
                    </div>
                </div>
            </div>
            <style>
                {`
                    .hover-row:hover {
                        background: rgba(255, 255, 255, 0.02);
                    }
                `}
            </style>
        </div>
    );
};

export default AuditTrailModal;

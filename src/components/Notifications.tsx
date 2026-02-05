import React from 'react';
import {
    FileText,
    MessageSquare,
    Calendar,
    CheckCircle,
    Clock,
    MoreVertical,
    Filter
} from 'lucide-react';

import { useNotifications } from '../context/NotificationContext';
import { Loader2 } from 'lucide-react';

const Notifications: React.FC = () => {
    const { notifications, markAllAsRead, markAsRead, refreshNotifications, loading } = useNotifications();

    const notifList = notifications.map(n => ({
        id: n.id,
        title: n.title,
        desc: n.message,
        time: new Date(n.created_at).toLocaleString(),
        icon: n.type === 'file' ? <FileText size={18} color="var(--umat-green)" /> :
            n.type === 'meeting' ? <Calendar size={18} color="var(--umat-gold)" /> :
                n.type === 'comment' ? <MessageSquare size={18} color="#3b82f6" /> :
                    n.type === 'success' ? <CheckCircle size={18} color="#10b981" /> :
                        n.type === 'warning' ? <CheckCircle size={18} color="var(--umat-gold)" /> :
                            <CheckCircle size={18} color="#10b981" />,
        read: n.is_read
    }));

    const markAllRead = async () => {
        await markAllAsRead();
    };

    const handleRead = async (id: string) => {
        await markAsRead(id);
    }

    const handleFilter = () => {
        refreshNotifications(); // For now, just refresh
    };

    return (
        <div className="main-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Notifications {loading && <Loader2 className="animate-spin inline-block ml-2" size={20} />}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Stay updated with board activities and file sharing alerts.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-outline" onClick={markAllRead}>Mark all as read</button>
                    <button className="btn-primary" onClick={handleFilter}>
                        <Filter size={18} style={{ marginRight: '8px' }} />
                        Filter
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: '800px' }}>
                <div className="glass-card" style={{ padding: '0' }}>
                    {notifList.map((notif, index) => (
                        <div
                            key={notif.id}
                            onClick={() => !notif.read && handleRead(notif.id)}
                            style={{
                                padding: '24px',
                                borderBottom: index < notifList.length - 1 ? '1px solid var(--glass-border)' : 'none',
                                display: 'flex',
                                gap: '20px',
                                background: notif.read ? 'transparent' : 'rgba(0, 104, 55, 0.05)',
                                position: 'relative',
                                transition: 'background 0.3s',
                                cursor: notif.read ? 'default' : 'pointer',
                            }}
                        >
                            {!notif.read && (
                                <div style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '0',
                                    bottom: '0',
                                    width: '4px',
                                    background: 'var(--umat-green)'
                                }} />
                            )}

                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'var(--glass)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {notif.icon}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: notif.read ? 600 : 700 }}>{notif.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        <Clock size={12} />
                                        {notif.time}
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: notif.read ? 'var(--text-muted)' : 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                                    {notif.desc}
                                </p>
                            </div>

                            <div style={{ alignSelf: 'center' }}>
                                <MoreVertical size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                            </div>
                        </div>
                    ))}
                    {notifList.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No new notifications.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;

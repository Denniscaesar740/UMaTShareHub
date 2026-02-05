import React, { useEffect, useState, useRef } from 'react';
import {
    Plus,
    Search,
    Bell,
    FileText,
    Clock,
    AlertCircle,
    Loader2,
    Moon,
    Sun,
    Check,
    Shield,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileIcon from './FileIcon';
import FileDetailView from './FileDetailView';
import { useFiles } from '../context/FileContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import { useTheme } from '../context/ThemeContext';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';


interface DashboardProps {
    onUploadClick: () => void;
    setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onUploadClick, setActiveTab }) => {
    const { theme, toggleTheme } = useTheme();
    const { recentItems, loading, fetchRecentFiles } = useFiles();
    const { meetings, fetchMeetings } = useMeetings();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { profile } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<any | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);

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

    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    useEffect(() => {
        fetchRecentFiles();
        fetchMeetings();
    }, [profile]);

    const allUpcomingMeetings = meetings.filter(m => m.status === 'Upcoming');
    const upcomingMeetings = [...allUpcomingMeetings]
        .sort((a, b) => new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime())
        .slice(0, 3);

    const stats = [
        { label: 'Cloud Documents', count: recentItems.length.toString(), icon: <FileText size={24} />, trend: 'Synchronized', color: 'var(--umat-green)', tab: 'All Files' },
        { label: 'Upcoming Governance', count: allUpcomingMeetings.length.toString(), icon: <Calendar size={24} />, trend: 'Scheduled Sessions', color: 'var(--umat-gold)', tab: 'Meetings' },
        { label: 'Portal Security', count: 'Active', icon: <AlertCircle size={24} />, trend: 'End-to-End', color: 'var(--umat-navy)', tab: 'Dashboard' },
    ];

    const filteredFiles = recentItems.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewCalendar = () => {
        setActiveTab('Meetings');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getDisplayName = () => {
        if (!profile?.full_name) return 'Board Member';
        const parts = profile.full_name.trim().split(/\s+/);
        if (parts.length <= 2) return profile.full_name;
        return `${parts[0]} ${parts[parts.length - 1]}`;
    };


    if (selectedFile) {
        return (
            <FileDetailView
                file={selectedFile}
                onBack={() => setSelectedFile(null)}
            />
        );
    }

    return (
        <div className="main-content" style={{ paddingBottom: '60px' }}>
            {/* Premium Header */}
            <header style={{
                marginBottom: '40px',
                position: 'relative'
            }}>
                <div className="header-flexbox">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="profile-greeting-container"
                    >
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, var(--umat-navy) 0%, var(--umat-green) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '2px solid var(--umat-gold)',
                                boxShadow: '0 10px 20px rgba(0, 107, 63, 0.2)'
                            }}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                                        {(profile?.full_name || 'U').charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                width: '18px',
                                height: '18px',
                                background: '#10b981',
                                borderRadius: '50%',
                                border: '3px solid var(--bg-card)'
                            }} />
                        </div>
                        <div>
                            <h1 className="playfair" style={{ fontSize: '2rem', margin: 0 }}>
                                {getGreeting()}, <span className="text-gradient">{getDisplayName()}</span>
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: '4px 0 0 0', fontWeight: 500 }}>
                                Welcome to your board portal command center.
                            </p>
                        </div>
                    </motion.div>

                    <div className="header-actions">
                        <div className="glass-card search-container">
                            <Search size={18} color="var(--text-muted)" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className="theme-toggle-wrapper">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="glass-card action-btn"
                                    onClick={toggleTheme}
                                >
                                    {theme === 'light' ? <Moon size={20} color="var(--text-main)" /> : <Sun size={20} color="var(--text-main)" />}
                                </motion.button>
                            </div>

                            <div style={{ position: 'relative' }} ref={notifRef}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="glass-card action-btn"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <Bell size={20} color="var(--text-main)" />
                                    {unreadCount > 0 && (
                                        <span className="notif-dot" />
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="glass-card"
                                            style={{
                                                position: 'absolute',
                                                top: '60px',
                                                right: '0',
                                                width: '340px',
                                                maxHeight: '450px',
                                                overflowY: 'auto',
                                                zIndex: 100,
                                                background: 'var(--bg-card)',
                                                padding: 0,
                                                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.4)',
                                            }}
                                        >
                                            <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Alert Center</h4>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                                                        style={{ background: 'none', border: 'none', color: 'var(--umat-gold)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                                                    >
                                                        Clear All
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ padding: '10px' }}>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                        <Bell size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>No new alerts.</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(notif => (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => markAsRead(notif.id)}
                                                            style={{
                                                                padding: '16px',
                                                                borderRadius: '12px',
                                                                marginBottom: '8px',
                                                                background: notif.is_read ? 'transparent' : 'rgba(251, 191, 36, 0.05)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                border: notif.is_read ? '1px solid transparent' : '1px solid rgba(251, 191, 36, 0.1)'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                <h5 style={{ margin: 0, fontSize: '0.9rem', color: notif.is_read ? 'var(--text-main)' : 'var(--umat-gold)' }}>{notif.title}</h5>
                                                                <Clock size={12} color="var(--text-muted)" />
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{notif.message}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button className="btn-primary" onClick={onUploadClick} style={{ padding: '12px 24px', borderRadius: '12px' }}>
                                <Plus size={20} />
                                <span>Contribute File</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Performance Stats */}
            <section className="stats-grid-container">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card shadow-hover"
                        style={{
                            padding: '32px',
                            cursor: 'pointer',
                            background: `linear-gradient(135deg, var(--bg-card) 0%, rgba(255,255,255,0.02) 100%)`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={() => setActiveTab(stat.tab)}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '100px',
                            height: '100px',
                            background: `${stat.color}08`,
                            borderRadius: '50%'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: `${stat.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: stat.color,
                                boxShadow: `0 8px 16px ${stat.color}10`
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
                                <h3 className="playfair" style={{ fontSize: '2rem', margin: '4px 0 0 0' }}>{stat.count}</h3>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <Check size={14} color="#10b981" />
                            {stat.trend}
                        </div>
                    </motion.div>
                ))}
            </section>

            <section className="dashboard-layout-grid">
                {/* Main Content Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                    style={{ padding: '0', overflow: 'hidden' }}
                >
                    <div style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                        <div>
                            <h3 className="playfair" style={{ fontSize: '1.5rem', margin: 0 }}>Recent Activity</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Latest contributions across the university board</p>
                        </div>
                        <button
                            onClick={() => setActiveTab('All Files')}
                            className="btn-outline"
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                            View All
                        </button>
                    </div>

                    <div className="responsive-table" style={{ padding: '0 16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left' }}>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Document Name</th>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Author</th>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                                    <th style={{ padding: '16px 20px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.slice(0, 6).map((file, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (index * 0.05) }}
                                        className="table-row-premium"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedFile(file)}
                                    >
                                        <td style={{ padding: '16px 20px', borderRadius: '12px 0 0 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{
                                                    padding: '10px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid var(--glass-border)'
                                                }}>
                                                    <FileIcon name={file.name} size={22} />
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{file.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{file.category} • {file.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: 'var(--umat-navy)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    border: '1px solid var(--umat-gold)',
                                                    overflow: 'hidden'
                                                }}>
                                                    {file.uploader_avatar ? (
                                                        <img src={file.uploader_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        file.uploader_name?.charAt(0)
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{file.uploader_name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {new Date(file.updated_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <Shield size={12} /> SECURE
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {loading && (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <Loader2 className="spinning" size={32} color="var(--umat-gold)" />
                                <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '0.9rem' }}>Indexing resources...</p>
                            </div>
                        )}
                        {!loading && filteredFiles.length === 0 && (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <Search size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No documents found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Sidebar Widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card"
                        style={{ padding: '32px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 className="playfair" style={{ fontSize: '1.25rem', margin: 0 }}>Board Meetings</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--umat-gold)', fontWeight: 600 }}>
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {upcomingMeetings.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No upcoming agendas.</p>
                                </div>
                            ) : (
                                upcomingMeetings.map((meeting) => (
                                    <div key={meeting.id} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                        <div style={{
                                            minWidth: '54px',
                                            height: '64px',
                                            background: 'var(--bg-card)',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid var(--glass-border)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--umat-gold)', fontWeight: 800, textTransform: 'uppercase' }}>
                                                {new Date(meeting.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                                                {new Date(meeting.date).getDate()}
                                            </span>
                                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                {new Date(meeting.date).getFullYear()}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '0.95rem', margin: '0 0 6px 0', fontWeight: 700, lineHeight: 1.4 }}>{meeting.title}</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={12} /> {meeting.start_time}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Plus size={12} /> {meeting.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            className="btn-outline"
                            style={{ width: '100%', marginTop: '32px', borderRadius: '12px' }}
                            onClick={handleViewCalendar}
                        >
                            Institutional Calendar
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card"
                        style={{
                            padding: '32px',
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(0,0,0,0.1))',
                            border: '1px solid rgba(251, 191, 36, 0.2)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 className="playfair" style={{ fontSize: '1.2rem', margin: 0 }}>Meeting Hub</h3>
                            <div style={{
                                padding: '4px 12px',
                                background: 'var(--umat-gold)',
                                color: 'var(--bg-dark)',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 800
                            }}>
                                {allUpcomingMeetings.length} PENDING
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 24px 0', lineHeight: 1.6 }}>
                            Initiate a new board session or synchronize existing agendas across the registry.
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', background: 'var(--umat-navy)', borderRadius: '12px' }}
                            onClick={() => setActiveTab('Meetings')}
                        >
                            <Plus size={18} /> Schedule Session
                        </button>
                    </motion.div>
                </div>
            </section>

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
            <style>{`
                .header-flexbox {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    gap: 24px;
                }
                .profile-greeting-container {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    min-width: 0;
                }
                .profile-greeting-container div:last-child {
                    min-width: 0;
                }
                .profile-greeting-container h1 {
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-shrink: 0;
                }
                .search-container {
                    padding: 10px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: var(--bg-card);
                    box-shadow: none;
                    border: 1px solid var(--glass-border);
                }
                .search-input {
                    background: none;
                    border: none;
                    color: var(--text-main);
                    outline: none;
                    width: 220px;
                    font-size: 0.95rem;
                }
                .action-btn {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    background: var(--bg-card);
                    color: var(--text-main);
                    position: relative;
                }
                .notif-dot {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--umat-gold);
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: 2px solid var(--bg-card);
                }
                .stats-grid-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    margin-bottom: 40px;
                }
                .dashboard-layout-grid {
                    display: grid;
                    grid-template-columns: minmax(600px, 3fr) 340px;
                    gap: 32px;
                }
                .responsive-table {
                    width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                .responsive-table table {
                    min-width: 600px;
                    width: 100%;
                }
                @media (max-width: 1600px) {
                    .dashboard-layout-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .header-flexbox {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 24px;
                    }
                    .header-actions {
                        width: 100%;
                        justify-content: flex-start;
                        flex-wrap: wrap;
                    }
                    .search-container {
                        width: 100%;
                    }
                    .search-input {
                        width: 100%;
                    }
                    .stats-grid-container {
                        grid-template-columns: 1fr;
                    }
                    .profile-greeting-container h1 {
                        font-size: 1.5rem !important;
                        white-space: normal;
                    }
                    .profile-greeting-container p {
                        font-size: 0.9rem !important;
                    }
                }

                @media (max-width: 480px) {
                    .profile-greeting-container {
                        gap: 16px;
                    }
                    .profile-greeting-container .avatar-wrapper {
                        width: 48px !important;
                        height: 48px !important;
                    }
                }

                .table-row-premium {
                    transition: all 0.2s ease;
                }
                .table-row-premium:hover {
                    background: rgba(255, 255, 255, 0.03) !important;
                    transform: translateX(4px);
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spinning {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;

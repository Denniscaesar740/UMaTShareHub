import React from 'react';
import {
    Home,
    Files,
    Users,
    Calendar,
    BarChart2,
    Settings,
    Shield,
    LogOut,
    FolderOpen,
    Bell,
    Trash2,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    UploadCloud,
    Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import UmatLogo from '../assets/Umatlogo.png';
import { useMeetings } from '../context/MeetingContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    onUploadClick: () => void;
    onLogout: () => void;
    isMobileOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed, onUploadClick, onLogout, isMobileOpen }) => {
    const { meetings } = useMeetings();
    const { unreadCount } = useNotifications();
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'Admin';

    const upcomingMeetingsCount = meetings.filter(m => m.status === 'Upcoming' || m.status === 'In Progress').length;


    // Simplified effect without pending count fetch
    useEffect(() => {
        // No admin specific sidebar logic for now
    }, [isAdmin]);

    const menuItems = [
        { icon: <Home size={20} />, label: 'Dashboard' },
        { icon: <Files size={20} />, label: 'All Files' },
        { icon: <Share2 size={20} />, label: 'Shared with me' },
        { icon: <FolderOpen size={20} />, label: 'Categories' },
        { icon: <Calendar size={20} />, label: 'Meetings', badge: upcomingMeetingsCount > 0 ? upcomingMeetingsCount.toString() : undefined },
        { icon: <Bell size={20} />, label: 'Notifications', badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount.toString()) : undefined },
        { icon: <Trash2 size={20} />, label: 'Trash' },
    ];

    const personalItems = [
        { icon: <Settings size={20} />, label: 'Profile Settings' },
        { icon: <Shield size={20} />, label: 'Account Security' },
    ];

    const adminItems = [
        { icon: <Users size={20} />, label: 'User Management' },
        { icon: <BarChart2 size={20} />, label: 'Analytics' },
    ];

    const supportItems = [
        { icon: <HelpCircle size={20} />, label: 'Help & Support' },
    ];

    const SidebarItem = ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => (
        <motion.div
            whileHover={{ x: 4 }}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: (collapsed && !isMobileOpen) ? 'center' : 'flex-start',
                padding: '12px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '4px',
                background: isActive ? 'linear-gradient(90deg, rgba(0, 104, 55, 0.1) 0%, transparent 100%)' : 'transparent',
                borderLeft: (!collapsed || isMobileOpen) && isActive ? '3px solid var(--umat-green)' : '3px solid transparent',
                color: isActive ? 'var(--umat-green)' : 'var(--text-muted)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
                {React.cloneElement(item.icon, {
                    color: isActive ? 'var(--umat-green)' : 'currentColor',
                    size: 20
                })}
            </div>

            {(!collapsed || isMobileOpen) && (
                <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ marginLeft: '12px', fontWeight: isActive ? 600 : 400, fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                >
                    {item.label}
                </motion.span>
            )}

            {/* Badge */}
            {(!collapsed || isMobileOpen) && item.badge && (
                <span style={{
                    marginLeft: 'auto',
                    background: item.label === 'Notifications' ? '#ef4444' : 'var(--umat-gold)',
                    color: item.label === 'Notifications' ? 'white' : 'var(--bg-dark)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    textAlign: 'center'
                }}>
                    {item.badge}
                </span>
            )}

            {/* Collapsed Badge Dot */}
            {(collapsed && !isMobileOpen) && item.badge && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: item.label === 'Notifications' ? '#ef4444' : 'var(--umat-gold)',
                    border: '1.5px solid var(--bg-card)'
                }} />
            )}
        </motion.div>
    );

    return (
        <motion.aside
            initial={false}
            animate={{ width: (collapsed && !isMobileOpen) ? '80px' : '280px' }}
            className={`glass-card mobile-drawer ${isMobileOpen ? 'open' : ''}`}
            style={{
                margin: '20px',
                height: 'calc(100vh - 40px)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                borderRadius: '24px',
                position: 'sticky',
                top: '20px',
                overflowY: 'auto',
                overflowX: 'hidden',
                zIndex: isMobileOpen ? 2000 : 'auto',
                background: 'var(--bg-card)'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', padding: '0 4px', cursor: 'pointer', position: 'relative' }}>
                <div
                    onClick={() => (!collapsed || isMobileOpen) && setActiveTab('Dashboard')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: (collapsed && !isMobileOpen) ? 'center' : 'flex-start',
                        gap: '12px',
                        flex: 1
                    }}
                >
                    <img
                        src={UmatLogo}
                        alt="UMAT Logo"
                        style={{
                            width: '40px',
                            height: 'auto'
                        }}
                    />
                    {(!collapsed || isMobileOpen) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                                UMAT <span style={{ color: 'var(--umat-green)' }}>ShareHub</span>
                            </h2>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.5px' }}>OFFICIAL ACADEMIC PORTAL</p>
                        </motion.div>
                    )}
                </div>

                {/* Action Buttons */}
                {!isMobileOpen && (
                    <div style={{ display: 'flex', gap: '8px', position: collapsed ? 'absolute' : 'relative', left: collapsed ? '50%' : 'auto', transform: collapsed ? 'translateX(-50%)' : 'none', top: collapsed ? '62px' : 'auto' }}>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                background: 'var(--glass)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginTop: (collapsed && !isMobileOpen) ? '40px' : '0' }}>
                {/* Quick Upload Button (Only expands when open) */}
                {(!collapsed || isMobileOpen) && (
                    <button
                        className="btn-primary"
                        style={{ width: '100%', marginBottom: '24px', justifyContent: 'center' }}
                        onClick={onUploadClick}
                    >
                        <UploadCloud size={18} />
                        <span>New Upload</span>
                    </button>
                )}

                <div style={{ marginBottom: '24px' }}>
                    {(!collapsed || isMobileOpen) && (
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '14px', letterSpacing: '1px' }}>
                            Main Menu
                        </p>
                    )}
                    {menuItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            item={item}
                            isActive={activeTab === item.label}
                            onClick={() => setActiveTab(item.label)}
                        />
                    ))}
                </div>

                {isAdmin && (
                    <div style={{ marginBottom: '24px' }}>
                        {(!collapsed || isMobileOpen) && (
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '14px', letterSpacing: '1px' }}>
                                Admin Space
                            </p>
                        )}
                        {adminItems.map((item, index) => (
                            <SidebarItem
                                key={index}
                                item={item}
                                isActive={activeTab === item.label}
                                onClick={() => setActiveTab(item.label)}
                            />
                        ))}
                    </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                    {(!collapsed || isMobileOpen) && (
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '14px', letterSpacing: '1px' }}>
                            Personal
                        </p>
                    )}
                    {personalItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            item={item}
                            isActive={activeTab === item.label}
                            onClick={() => setActiveTab(item.label)}
                        />
                    ))}
                </div>

                <div>
                    {(!collapsed || isMobileOpen) && (
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '14px', letterSpacing: '1px' }}>
                            Support
                        </p>
                    )}
                    {supportItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            item={item}
                            isActive={activeTab === item.label}
                            onClick={() => setActiveTab(item.label)}
                        />
                    ))}
                </div>
            </div>

            {/* Footer Profile */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: (collapsed && !isMobileOpen) ? 'center' : 'flex-start', gap: '12px', padding: '0 4px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--umat-navy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--umat-gold)',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        border: '2px solid var(--umat-gold)',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            (profile?.full_name || 'U').charAt(0)
                        )}
                    </div>

                    {(!collapsed || isMobileOpen) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ flex: 1, overflow: 'hidden' }}
                        >
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {profile?.full_name || 'User'}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap' }}>
                                {profile?.role || 'Institutional User'}
                            </p>
                        </motion.div>
                    )}

                    <LogOut
                        size={18}
                        color="var(--text-muted)"
                        style={{
                            cursor: 'pointer',
                            minWidth: '18px',
                            marginLeft: (collapsed && !isMobileOpen) ? '0' : 'auto'
                        }}
                        onClick={onLogout}
                    />
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;

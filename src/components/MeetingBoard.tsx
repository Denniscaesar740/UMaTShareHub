import React, { useState } from 'react';
import {
    Clock,
    MapPin,
    Users,
    FileText,
    Plus,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    ExternalLink,
    Calendar,
    Loader2
} from 'lucide-react';
import MeetingDetailModal from './MeetingDetailModal';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';

import type { Meeting } from '../context/MeetingContext';

import { useMeetings } from '../context/MeetingContext';
import { useEffect } from 'react';

const MeetingBoard: React.FC = () => {
    const { meetings, loading, fetchMeetings } = useMeetings();
    const [filter, setFilter] = useState<'Upcoming' | 'Past'>('Upcoming');
    const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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
        fetchMeetings();
    }, []);

    const filteredMeetings = meetings.filter(m =>
        filter === 'Upcoming' ? (m.status === 'Upcoming' || m.status === 'In Progress') : m.status === 'Completed'
    );

    const trendingMeeting = meetings.find(m => m.status === 'In Progress') || meetings.find(m => m.status === 'Upcoming');

    const openMeetingDetail = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setIsDetailModalOpen(true);
    };

    const handleJoinSession = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (trendingMeeting?.link) {
            window.open(trendingMeeting.link, '_blank');
        } else {
            setConfirmModal({
                isOpen: true,
                title: 'Link Unavailable',
                description: 'No virtual meeting link has been provided for this institutional session. Please contact the board secretary.',
                type: 'warning',
                confirmText: 'Acknowledge',
                confirmOnly: true,
                onConfirm: () => { }
            });
        }
    };

    const handleDownloadAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Packing Resources',
            description: 'Preparing all meeting resources (Agendas, Minutes, and Presentations) for download... Your archive will be ready momentarily.',
            type: 'info',
            confirmText: 'Start Pack',
            confirmOnly: true,
            onConfirm: () => {
                setTimeout(() => {
                    setConfirmModal({
                        isOpen: true,
                        title: 'Download Ready',
                        description: 'Your institutional resource archive (UMaT_Meeting_Resources.zip) is ready and the transmission has started.',
                        type: 'success',
                        confirmText: 'Great',
                        confirmOnly: true,
                        onConfirm: () => { }
                    });
                }, 1500);
            }
        });
    };

    const handleScheduleMeeting = () => {
        setIsScheduleModalOpen(true);
    };

    const handleContactSupport = () => {
        setConfirmModal({
            isOpen: true,
            title: 'IT Support Sync',
            description: 'Connecting you to UMaT IT Support. A support representative will be with you shortly via the secure institutional portal chat.',
            type: 'info',
            confirmText: 'Begin Session',
            confirmOnly: true,
            onConfirm: () => { }
        });
    };

    return (
        <div className="main-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Meeting Center</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage board meetings, agendas, and academic minutes. {loading && <Loader2 className="animate-spin inline-block ml-2" size={16} />}</p>
                </div>
                <button className="btn-primary" onClick={handleScheduleMeeting} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    <Plus size={18} />
                    Schedule Meeting
                </button>
            </header>

            <div className="flex-mobile-column" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Active/In-Progress Meeting Highlight */}
                    {trendingMeeting ? (
                        <div
                            className="glass-card trending-meeting-card"
                            style={{
                                padding: '30px',
                                background: 'var(--umat-green)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                animation: 'fadeIn 0.8s ease-out',
                                cursor: 'pointer'
                            }}
                            onClick={() => openMeetingDetail(trendingMeeting as Meeting)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <span style={{
                                        background: 'var(--umat-gold)',
                                        color: 'var(--bg-dark)',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        Happening Soon
                                    </span>
                                    <h2 style={{ fontSize: '1.75rem', marginTop: '16px', marginBottom: '8px', color: 'white' }}>{trendingMeeting.title}</h2>
                                    <div style={{ display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {trendingMeeting.start_time} - {trendingMeeting.end_time}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {trendingMeeting.location}</span>
                                    </div>
                                </div>
                                <button
                                    className="glass-card"
                                    style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.15)', fontWeight: 600, cursor: 'pointer', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                                    onClick={handleJoinSession}
                                >
                                    Join Session
                                </button>
                            </div>

                            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ padding: '10px', background: 'var(--umat-green)', borderRadius: '8px' }}>
                                            <FileText size={20} color="var(--umat-gold)" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600, color: 'white' }}>Agenda and Resources</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Required reading for members</p>
                                        </div>
                                    </div>
                                    <button
                                        style={{ background: 'none', color: 'var(--umat-gold)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', border: 'none' }}
                                        onClick={handleDownloadAll}
                                    >
                                        Download All
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p>No meetings currently in progress.</p>
                        </div>
                    )}

                    {/* Meeting List */}
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>{filter} Board Meetings</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn-outline"
                                    style={{ padding: '6px 12px', fontSize: '0.85rem', background: filter === 'Upcoming' ? 'var(--glass-border)' : 'transparent' }}
                                    onClick={() => setFilter('Upcoming')}
                                >
                                    Upcoming
                                </button>
                                <button
                                    className="btn-outline"
                                    style={{ padding: '6px 12px', fontSize: '0.85rem', border: 'none', background: filter === 'Past' ? 'var(--glass-border)' : 'transparent' }}
                                    onClick={() => setFilter('Past')}
                                >
                                    Past
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredMeetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="glass-card meeting-item"
                                    style={{
                                        padding: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => openMeetingDetail(meeting)}
                                >
                                    <div className="meeting-item-date" style={{
                                        minWidth: '60px',
                                        height: '70px',
                                        background: 'var(--glass)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                            {new Date(meeting.date).toLocaleString('default', { month: 'short' })}
                                        </span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--umat-gold)' }}>
                                            {new Date(meeting.date).getDate()}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{meeting.title}</h4>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: 'rgba(0, 107, 63, 0.1)',
                                                color: 'var(--umat-green)',
                                                fontWeight: 600
                                            }}>
                                                {meeting.category}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {meeting.start_time}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {meeting.location}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {meeting.attendees || 0} Members</span>
                                        </div>
                                    </div>

                                    {/* <div style={{ display: 'flex', gap: '12px' }}>
                                        <div
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            onClick={(e) => { e.stopPropagation(); console.log('Open chat'); }}
                                        >
                                            <MessageSquare size={18} />
                                        </div>
                                        <div
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            onClick={(e) => { e.stopPropagation(); console.log('Open options'); }}
                                        >
                                            <MoreVertical size={18} />
                                        </div>
                                    </div> */}
                                </div>
                            ))}
                            {filteredMeetings.length === 0 && (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No {filter.toLowerCase()} meetings found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Calendar/Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem' }}>Calendar</h3>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <ChevronLeft size={18} cursor="pointer" />
                                <ChevronRight size={18} cursor="pointer" />
                            </div>
                        </div>
                        {/* Minimal Calendar Mockup */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{d}</span>
                            ))}
                            {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = new Date(new Date().getFullYear(), new Date().getMonth(), day).toISOString().split('T')[0];
                                const hasMeeting = meetings.some(m => m.date === dateStr);
                                const isToday = day === new Date().getDate();

                                return (
                                    <div key={i} style={{
                                        padding: '8px 0',
                                        fontSize: '0.85rem',
                                        borderRadius: '8px',
                                        background: isToday ? 'var(--umat-green)' : 'transparent',
                                        color: isToday ? 'white' : 'var(--text-main)',
                                        border: hasMeeting ? '1px solid var(--umat-gold)' : 'none',
                                        position: 'relative',
                                        cursor: 'default'
                                    }}>
                                        {day}
                                        {hasMeeting && (
                                            <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--umat-gold)' }}></div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Action Items</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', color: 'var(--text-muted)' }}>
                            <CheckCircle2 size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>No pending action items.</p>
                        </div>
                    </div>

                    <div className="glass-card" style={{
                        padding: '24px',
                        background: 'rgba(251, 191, 36, 0.05)',
                        border: '1px dashed var(--umat-gold)',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Need help with the portal?</p>
                        <button
                            className="btn-outline"
                            style={{ fontSize: '0.85rem', width: '100%' }}
                            onClick={handleContactSupport}
                        >
                            <ExternalLink size={14} style={{ marginRight: '8px' }} />
                            Contact IT Support
                        </button>
                    </div>
                </div>
            </div>

            <MeetingDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                meeting={selectedMeeting}
            />

            <ScheduleMeetingModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
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
            <style>{`
                @media (max-width: 768px) {
                    .main-content header {
                        flex-direction: column;
                        align-items: flex-start !important;
                    }
                    .main-content header .btn-primary {
                        width: 100%;
                        justify-content: center;
                    }
                    .trending-meeting-card {
                        padding: 20px !important;
                    }
                    .trending-meeting-card h2 {
                        font-size: 1.4rem !important;
                    }
                    .meeting-item {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 16px !important;
                    }
                    .meeting-item-date {
                        width: 100% !important;
                        flex-direction: row !important;
                        height: auto !important;
                        padding: 10px !important;
                        gap: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default MeetingBoard;

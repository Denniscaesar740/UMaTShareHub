import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    X,
    Clock,
    MapPin,
    Users,
    FileText,
    Calendar,
    CheckCircle2,
    Download,
    MessageSquare,
    ExternalLink,
    Video
} from 'lucide-react';
import type { Meeting } from '../context/MeetingContext';

interface MeetingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    meeting: Meeting | null;
}

const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ isOpen, onClose, meeting }) => {
    const [attendeeProfiles, setAttendeeProfiles] = useState<any[]>([]);

    useEffect(() => {
        const fetchAttendeeProfiles = async () => {
            if (meeting?.attendee_list && meeting.attendee_list.length > 0) {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .in('id', meeting.attendee_list);

                    if (error) throw error;
                    if (data) setAttendeeProfiles(data);
                } catch (error) {
                    console.error('Error fetching attendee profiles:', error);
                }
            } else {
                setAttendeeProfiles([]);
            }
        };

        if (isOpen && meeting) {
            fetchAttendeeProfiles();
        }
    }, [isOpen, meeting]);

    if (!isOpen || !meeting) return null;

    const documents = meeting.attached_docs || [];

    return (
        <div
            className="fixed inset-0 z-[4000] flex items-center justify-center p-4"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 4000,
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '95%',
                    maxWidth: '1000px',
                    height: '96vh',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 350px',
                    overflow: 'hidden',
                    animation: 'slideUp 0.4s ease-out',
                    background: 'var(--bg-modal)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    color: 'var(--text-main)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Main Content Area */}
                <div style={{ padding: '40px', overflowY: 'auto', borderRight: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    color: 'var(--umat-gold)',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    {meeting.category} Meeting
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: meeting.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                    color: meeting.status === 'Completed' ? '#10b981' : 'var(--umat-gold)',
                                    fontWeight: 700
                                }}>
                                    {meeting.status}
                                </span>
                            </div>
                            <h2 style={{ fontSize: '2.25rem', marginBottom: '16px', lineHeight: 1.2 }}>{meeting.title}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                                    <Calendar size={18} color="var(--umat-gold)" />
                                    <span>{meeting.date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                                    <Clock size={18} color="var(--umat-gold)" />
                                    <span>{meeting.start_time} {meeting.end_time ? `- ${meeting.end_time}` : ''}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                                    <MapPin size={18} color="var(--umat-gold)" />
                                    <span>{meeting.location}</span>
                                </div>
                            </div>
                            {meeting.description && (
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.95rem' }}>{meeting.description}</p>
                            )}
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}>
                            <X size={28} />
                        </button>
                    </div>

                    {/* Agenda Section - Only show if description is used as agenda or if we had an agenda field */}
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={20} color="var(--umat-gold)" /> Meeting Brief
                        </h3>
                        <div style={{ background: 'var(--glass)', borderRadius: '16px', border: '2px solid var(--glass-border)', padding: '24px' }}>
                            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                {meeting.description || 'No specific agenda details provided for this meeting.'}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Users size={18} color="var(--umat-gold)" /> Expected Attendees ({meeting.attendees || 0})
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {attendeeProfiles.map((profile) => (
                                    <div key={profile.id} style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'var(--umat-navy)',
                                        border: '2px solid var(--bg-card)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--umat-gold)',
                                        overflow: 'hidden',
                                        cursor: 'help',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }} title={profile.full_name}>
                                        {profile.avatar_url ? (
                                            <img
                                                src={profile.avatar_url}
                                                alt={profile.full_name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                                {profile.full_name?.split(' ').map((n: any) => n[0]).join('').toUpperCase() || '?'}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {(meeting.attendees || 0) > attendeeProfiles.length && (
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'var(--glass)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        border: '2px solid var(--bg-card)'
                                    }}>
                                        +{(meeting.attendees || 0) - attendeeProfiles.length}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MessageSquare size={18} color="var(--umat-gold)" /> Private Notes
                            </h3>
                            <textarea
                                placeholder="Add your private notes here..."
                                style={{
                                    width: '100%',
                                    height: '80px',
                                    background: 'var(--glass)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    resize: 'none',
                                    fontSize: '0.9rem'
                                }}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions Area */}
                <aside style={{ padding: '40px', background: 'var(--glass)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '20px', letterSpacing: '1px' }}>
                            Meeting Actions
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {meeting.status !== 'Completed' && (
                                <button className="btn-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
                                    <Video size={18} /> Join Video Session
                                </button>
                            )}
                            <button className="btn-outline" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
                                <ExternalLink size={18} /> Add to Calendar
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '20px', letterSpacing: '1px' }}>
                            Resources ({documents.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {documents.map((doc, idx) => (
                                <div key={idx} style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <FileText size={16} color="var(--umat-green)" />
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)' }}>{doc.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Archive Document</p>
                                        </div>
                                    </div>
                                    <Download size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => window.open(doc.url, '_blank')} />
                                </div>
                            ))}
                        </div>
                        <button style={{
                            marginTop: '16px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--umat-gold)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <Download size={14} /> Download All Zip
                        </button>
                    </div>

                    <div style={{ marginTop: 'auto', background: '#006b3f', borderRadius: '16px', padding: '20px', color: '#ffffff' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                            <CheckCircle2 size={18} color="#fbbf24" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Attendance Marked</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                            Your attendance for this meeting has been pre-confirmed by the Board Secretary.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default MeetingDetailModal;

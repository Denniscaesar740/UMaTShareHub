import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { supabase } from '../lib/supabase';

export interface Meeting {
    id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    link?: string;
    description?: string;
    category: string;
    status: 'Upcoming' | 'In Progress' | 'Completed';
    attendees?: number;
    attendee_list?: string[];
    attached_docs?: { name: string, url: string }[];
    owner_id?: string;
}

interface MeetingContextType {
    meetings: Meeting[];
    loading: boolean;
    fetchMeetings: () => Promise<void>;
    scheduleMeeting: (meetingData: Omit<Meeting, 'id' | 'status'>) => Promise<void>;
    updateMeetingStatus: (id: string, status: Meeting['status']) => Promise<void>;
    deleteMeeting: (id: string) => Promise<void>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { createNotification } = useNotifications();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMeetings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('meetings')
                .select('*')
                .order('date', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) throw error;
            if (data) {
                setMeetings(data);
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Track notified meetings for reminders in this session
    const notifiedReminders = React.useRef<Set<string>>(new Set());

    const scheduleMeeting = async (meetingData: Omit<Meeting, 'id' | 'status'>) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('meetings')
                .insert([{
                    ...meetingData,
                    status: 'Upcoming',
                    attendees: meetingData.attendee_list?.length || 0,
                    owner_id: user.id
                }])
                .select()
                .single();

            if (error) throw error;

            setMeetings(prev => [...prev, data]);

            // Notify Creator
            await createNotification(
                user.id,
                'Meeting Scheduled',
                `You scheduled "${meetingData.title}" for ${new Date(meetingData.date).toLocaleDateString()}.`,
                'meeting'
            );

            // Notify Attendees
            if (meetingData.attendee_list && meetingData.attendee_list.length > 0) {
                // Assuming attendee_list contains User IDs
                for (const inviteeId of meetingData.attendee_list) {
                    if (inviteeId !== user.id) {
                        await createNotification(
                            inviteeId,
                            'New Meeting Invitation',
                            `You have been invited to "${meetingData.title}" on ${new Date(meetingData.date).toLocaleDateString()}.`,
                            'meeting'
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            throw error;
        }
    };

    // Reminder Logic
    useEffect(() => {
        if (!user || meetings.length === 0) return;

        const checkReminders = () => {
            const now = new Date();
            meetings.forEach(meeting => {
                if (meeting.status !== 'Upcoming') return;

                const meetingDateTime = new Date(`${meeting.date}T${meeting.start_time}`);
                const diffMs = meetingDateTime.getTime() - now.getTime();
                const diffMins = diffMs / (1000 * 60);

                // If meeting is within 15 mins and hasn't been notified yet
                if (diffMins > 0 && diffMins <= 15 && !notifiedReminders.current.has(meeting.id)) {
                    notifiedReminders.current.add(meeting.id);
                    createNotification(
                        user.id,
                        'Meeting Reminder',
                        `"${meeting.title}" starts in ${Math.ceil(diffMins)} minutes.`,
                        'meeting'
                    );
                }
            });
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Run immediately

        return () => clearInterval(interval);
    }, [user, meetings]);

    const updateMeetingStatus = async (id: string, status: Meeting['status']) => {
        try {
            const { error } = await supabase
                .from('meetings')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setMeetings(prev => prev.map(m => m.id === id ? { ...m, status } : m));
        } catch (error) {
            console.error('Error updating meeting status:', error);
        }
    };

    const deleteMeeting = async (id: string) => {
        try {
            const { error } = await supabase
                .from('meetings')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMeetings(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error('Error deleting meeting:', error);
        }
    };

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('meetings-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'meetings'
                },
                () => {
                    fetchMeetings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchMeetings();
        } else {
            setMeetings([]);
        }
    }, [user]);

    return (
        <MeetingContext.Provider value={{ meetings, loading, fetchMeetings, scheduleMeeting, updateMeetingStatus, deleteMeeting }}>
            {children}
        </MeetingContext.Provider>
    );
};

export const useMeetings = () => {
    const context = useContext(MeetingContext);
    if (context === undefined) {
        throw new Error('useMeetings must be used within a MeetingProvider');
    }
    return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'file' | 'meeting' | 'comment';
    is_read: boolean;
    created_at: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    createNotification: (userId: string, title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error' | 'file' | 'meeting' | 'comment') => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null;

        if (user) {
            fetchNotifications();

            // Realtime subscription
            // Use unique channel name per user to prevent conflicts
            channel = supabase
                .channel(`notifications:user:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*', // Listen for ALL events (INSERT, UPDATE, DELETE)
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('Realtime notification refresh:', payload.eventType);

                        if (payload.eventType === 'INSERT') {
                            setNotifications((prev) => [payload.new as Notification, ...prev]);
                        } else if (payload.eventType === 'UPDATE') {
                            setNotifications((prev) =>
                                prev.map(n => n.id === payload.new.id ? (payload.new as Notification) : n)
                            );
                        } else if (payload.eventType === 'DELETE') {
                            setNotifications((prev) =>
                                prev.filter(n => n.id !== payload.old.id)
                            );
                        }
                    }
                )
                .subscribe();

        } else {
            setNotifications([]);
        }

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [user]);

    const refreshNotifications = async () => {
        await fetchNotifications();
    };

    const markAsRead = async (id: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const createNotification = async (
        userId: string,
        title: string,
        message: string,
        type: 'info' | 'success' | 'warning' | 'error' | 'file' | 'meeting' | 'comment' = 'info'
    ) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: userId,
                    title,
                    message,
                    type,
                    is_read: false
                }]);

            if (error) throw error;
            // No need to manually update state if realtime is working, but harmless to fetch or let realtime handle it.
            // If we are creating for *another* user, realtime on *their* end handles it.
            // If for self, realtime handles it too.
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                markAsRead,
                markAllAsRead,
                createNotification,
                refreshNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

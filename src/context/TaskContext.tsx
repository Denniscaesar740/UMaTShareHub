import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { supabase } from '../lib/supabase';

export interface Task {
    id: string;
    title: string;
    description?: string;
    assignee_id?: string;
    meeting_id?: string;
    due_date?: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    created_by: string;
    created_at: string;
    assignee?: {
        full_name: string;
        avatar_url?: string;
    };
    creator?: {
        full_name: string;
    };
}

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    fetchTasks: () => Promise<void>;
    createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'status' | 'created_by'>) => Promise<void>;
    updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    assignTask: (taskId: string, userId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { createNotification } = useNotifications();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTasks = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch tasks where user is assignee OR creator OR user is Admin
            // For simplicity, we fetch all relevant tasks and filter via RLS on backend, 
            // but here we just select everything allowed.
            const { data, error } = await supabase
                .from('action_items')
                .select(`
                    *,
                    assignee:assignee_id(full_name, avatar_url),
                    creator:created_by(full_name)
                `)
                .order('due_date', { ascending: true });

            if (error) throw error;
            if (data) {
                setTasks(data as any);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'status' | 'created_by'>) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('action_items')
                .insert([{
                    ...taskData,
                    status: 'Pending',
                    created_by: user.id
                }])
                .select(`
                    *,
                    assignee:assignee_id(full_name, avatar_url),
                    creator:created_by(full_name)
                `)
                .single();

            if (error) throw error;

            setTasks(prev => [data as any, ...prev]);

            // Notify assignee if it's not the creator
            if (taskData.assignee_id && taskData.assignee_id !== user.id) {
                await createNotification(
                    taskData.assignee_id,
                    'New Task Assigned',
                    `You have been assigned a new task: "${taskData.title}"`,
                    'info'
                );
            }
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    };

    const updateTaskStatus = async (id: string, status: Task['status']) => {
        try {
            const { error } = await supabase
                .from('action_items')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const assignTask = async (taskId: string, userId: string) => {
        try {
            const { error } = await supabase
                .from('action_items')
                .update({ assignee_id: userId })
                .eq('id', taskId);

            if (error) throw error;

            // Refresh logic or optimistic update
            // We would need to fetch the user details to update optimistic UI accurately
            fetchTasks();
        } catch (error) {
            console.error('Error assigning task:', error);
        }
    };

    const deleteTask = async (id: string) => {
        try {
            const { error } = await supabase
                .from('action_items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks();
        } else {
            setTasks([]);
        }
    }, [user]);

    return (
        <TaskContext.Provider value={{ tasks, loading, fetchTasks, createTask, updateTaskStatus, deleteTask, assignTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};

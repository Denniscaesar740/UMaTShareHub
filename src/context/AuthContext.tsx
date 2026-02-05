import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, logAction } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import ConfirmModal, { type ConfirmType } from '../components/ConfirmModal';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: 'Admin' | 'Board Member' | 'Viewer' | 'Guest' | 'Secretary';
    department: string;
    avatar_url?: string;
    last_active?: string;
    status: 'Active' | 'Rejected' | 'Inactive' | 'Pending';
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, data: any) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    updateProfileAvatar: (url: string) => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;
    updateProfile: (data: Partial<Profile>) => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Global Confirm Modal for Auth Events
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
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        // Realtime profile updates
        let profileSub: any = null;
        if (user) {
            profileSub = supabase
                .channel(`profile:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('Profile updated in realtime:', payload);
                        const newProfile = payload.new as Profile;
                        setProfile(newProfile);

                        // If access is revoked or rejected, signOut immediately
                        if (newProfile.status === 'Inactive' || newProfile.status === 'Rejected') {
                            setConfirmModal({
                                isOpen: true,
                                title: 'Access Modified',
                                description: 'Your institutional access protocol has been updated by the administrator. You will be signed out for security synchronization.',
                                type: 'danger',
                                confirmText: 'Synchronize Now',
                                confirmOnly: true,
                                onConfirm: async () => {
                                    await signOut();
                                    window.location.reload(); // Force reload to clear all states
                                }
                            });
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            authSub.unsubscribe();
            if (profileSub) supabase.removeChannel(profileSub);
        };
    }, [user?.id]);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
                // Update last_active
                await supabase
                    .from('profiles')
                    .update({ last_active: new Date().toISOString() })
                    .eq('id', userId);
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error };
        }

        // Check user status
        if (data.user) {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('status')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error("Error fetching profile during login:", profileError);
                // Allow login if profile check fails? Or block? Safe to block if strict.
            } else if (profileData) {
                if (profileData.status !== 'Active') {
                    await supabase.auth.signOut();
                    return {
                        error: {
                            message: `Access denied. Your account status is: ${profileData.status}. Please contact the administrator.`
                        }
                    };
                }
            }
            await logAction(data.user.id, 'Authentication Login', 'Account', data.user.id, { method: 'institutional_portal' });
        }

        return { error: null };
    };

    const signUp = async (email: string, password: string, data: any) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: data.full_name,
                    department: data.department,
                    // Security: Verify metadata doesn't contain sensitive overrides if used by triggers
                }
            }
        });

        if (authError) {
            return { error: authError };
        }

        if (authData.user) {
            // Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user.id,
                        full_name: data.full_name,
                        email: email,
                        department: data.department,
                        role: 'Board Member', // FORCE SAFE ROLE. Do not trust data.role
                        status: 'Pending',
                        last_active: new Date().toISOString()
                    }
                ]);

            if (profileError) {
                console.error('Error creating profile:', profileError);
                return { error: profileError };
            }
            await logAction(authData.user.id, 'Institutional Registration', 'Account', authData.user.id, { role: 'Board Member', dept: data.department });
        }

        return { error: null };
    };

    const signOut = async () => {
        if (user) {
            await logAction(user.id, 'Authentication Logout', 'Account', user.id);
        }
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    const updateProfileAvatar = async (url: string) => {
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: url })
                .eq('id', user.id);

            if (!error) {
                setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
            }
        }
    };

    const uploadAvatar = async (file: File) => {
        if (!user) return;

        try {
            // 1. Upload to Storage (avatars bucket)
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_avatar.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update profile with the permanent URL
            await updateProfileAvatar(publicUrl);
            await logAction(user.id, 'Avatar Workspace Update', 'Profile', user.id, { filename: fileName });
        } catch (error) {
            console.error('Error in uploadAvatar:', error);
            throw error;
        }
    };

    const updateProfile = async (data: Partial<Profile>) => {
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update(data)
                .eq('id', user.id);

            if (!error) {
                setProfile(prev => prev ? { ...prev, ...data } : null);
                await logAction(user.id, 'Profile Criteria Modified', 'Profile', user.id, data);
            }
        }
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password', // Ensure you have a route for this if needed, or just let it link to home
        });
        return { error };
    };

    const value = {
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfileAvatar,
        uploadAvatar,
        updateProfile,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
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
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


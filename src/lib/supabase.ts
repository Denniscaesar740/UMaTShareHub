
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const logAction = async (userId: string, action: string, entityType?: string, entityId?: string, details?: any) => {
    try {
        await supabase.from('audit_logs').insert([{
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details
        }]);
    } catch (e) {
        console.error('Failed to log action:', e);
    }
};

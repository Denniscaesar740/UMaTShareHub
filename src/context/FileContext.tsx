import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { supabase, logAction } from '../lib/supabase';

export interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: string;
    updated_at: string;
    category: string;
    created_at?: string;
    parent_id?: string | null;
    url?: string;
    visibility: 'everyone' | 'specific' | 'private';
    shared_with: string[];
    user_id: string;
    is_deleted?: boolean;
    deleted_at?: string;
    uploader_name?: string;
    uploader_avatar?: string;
    storage_path?: string;
    is_pinned?: boolean;
}

interface FileContextType {
    items: FileItem[];
    recentItems: FileItem[];
    trashItems: FileItem[];
    sharedItems: any[];
    categoryItems: FileItem[];
    loading: boolean;
    currentFolderId: string | null;
    setCurrentFolderId: (id: string | null) => void;
    fetchFiles: (parentId?: string | null) => Promise<void>;
    fetchRecentFiles: () => Promise<void>;
    fetchTrashFiles: () => Promise<void>;
    fetchFilesByCategory: (category: string) => Promise<void>;
    fetchSharedFiles: (parentId?: string | null) => Promise<void>;
    uploadFile: (file: File, parentId: string | null, category: string, visibility: string, sharedWith: string[], onProgress?: (progress: number) => void) => Promise<void>;
    createFolder: (name: string, parentId: string | null, category: string) => Promise<void>;
    deleteItem: (id: string, permanent?: boolean) => Promise<void>;
    restoreItem: (id: string) => Promise<void>;
    emptyTrash: () => Promise<void>;
    togglePin: (id: string, currentStatus: boolean) => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ... (state declarations)
    const { user, profile } = useAuth();
    const [items, setItems] = useState<FileItem[]>([]);
    const [recentItems, setRecentItems] = useState<FileItem[]>([]);
    const [trashItems, setTrashItems] = useState<FileItem[]>([]);
    const [sharedItems, setSharedItems] = useState<any[]>([]);
    const [categoryItems, setCategoryItems] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    // Fetch helper to map database result to FileItem
    const mapDbToFileItem = (data: any): FileItem => ({
        id: data.id,
        name: data.name,
        type: data.type,
        size: data.size,
        updated_at: data.updated_at,
        created_at: data.created_at,
        category: data.category,
        parent_id: data.parent_id,
        url: data.url,
        visibility: data.visibility,
        shared_with: data.shared_with || [],
        user_id: data.user_id,
        is_deleted: data.is_deleted,
        deleted_at: data.deleted_at,
        uploader_name: data.profiles?.full_name || 'Unknown',
        uploader_avatar: data.profiles?.avatar_url,
        storage_path: data.storage_path,
        is_pinned: data.is_pinned || false
    });

    const fetchFiles = async (parentId: string | null = null) => {
        // ... (existing fetchFiles logic)
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('files')
                .select('*, profiles(full_name, avatar_url)')
                .eq('is_deleted', false)
                .or(`user_id.eq.${user.id},visibility.eq.everyone,shared_with.cs.{${user.id}}`);

            if (parentId) {
                query = query.eq('parent_id', parentId);
            } else {
                query = query.is('parent_id', null);
            }

            // Order by pinned first, then by type (folders first), then by name
            const { data, error } = await query
                .order('is_pinned', { ascending: false })
                .order('type', { ascending: false }) // folders first usually
                .order('name', { ascending: true });

            if (error) throw error;
            if (data) {
                setItems(data.map(mapDbToFileItem));
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of old functions: fetchRecentFiles, fetchTrashFiles, fetchFilesByCategory, fetchSharedFiles)
    // IMPORTANT: I need to preserve them. Since I am replacing the whole file context content block effectively by not providing full context in ReplacementContent with simple string matching, 
    // I should use the specific block replacement if possible.
    // However, I will use a larger block or partial block replacement.
    // Let's try to just insert the togglePin and update interface/mapping.

    // Better strategy: Use multiple chunks.

    // Chunk 1: Interface
    // Chunk 2: mapDbToFileItem
    // Chunk 3: fetchFiles (to add ordering)
    // Chunk 4: togglePin implementation
    // Chunk 5: Provider value

    // Doing this in one go with the MultiReplaceFileContent tool (though I only have replace_file_content in the prompt list? NO, I have replace_file_content but in previous turns showed multi support? No, standard replace_file_content doesn't support multiple non-contiguous blocks. I must use `multi_replace_file_content` if available, or sequential calls.
    // Checking tools... `multi_replace_file_content` IS available.

    // Wait, the prompt lists `replace_file_content` and `multi_replace_file_content` in the definitions?
    // Let me check 'Basic Tool Definitions' provided early in conversation?
    // The provided tools list includes `multi_replace_file_content`.

    // I shall use `multi_replace_file_content`.

    // ... logic continues ...

    const togglePin = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('files')
                .update({ is_pinned: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic Update
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, is_pinned: !currentStatus } : item
            ));

            // Also update other lists if necessary
            setRecentItems(prev => prev.map(item =>
                item.id === id ? { ...item, is_pinned: !currentStatus } : item
            ));

            if (user) {
                await logAction(user.id, currentStatus ? 'Institutional Unpin' : 'Institutional Pin', 'File', id);
            }

        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    // ...


    const fetchRecentFiles = async () => {
        if (!user) return;
        // Don't set global loading here to avoid flicker on main file view
        try {
            const { data, error } = await supabase
                .from('files')
                .select('*, profiles(full_name, avatar_url)')
                .eq('is_deleted', false)
                .eq('type', 'file')
                .or(`user_id.eq.${user.id},visibility.eq.everyone`)
                .order('updated_at', { ascending: false })
                .limit(8);

            if (error) throw error;
            if (data) {
                setRecentItems(data.map(mapDbToFileItem));
            }
        } catch (error) {
            console.error('Error fetching recent files:', error);
        }
    };

    const fetchTrashFiles = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('files')
                .select('*, profiles(full_name, avatar_url)')
                .eq('is_deleted', true)
                .eq('user_id', user.id); // Only my trash

            if (error) throw error;
            if (data) {
                setTrashItems(data.map(mapDbToFileItem));
            }
        } catch (error) {
            console.error('Error fetching trash:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilesByCategory = async (category: string) => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('files')
                .select('*, profiles(full_name, avatar_url)')
                .eq('is_deleted', false)
                .or(`user_id.eq.${user.id},visibility.eq.everyone,shared_with.cs.{${user.id}}`);

            // Classification Logic
            if (category === 'Images') {
                query = query.or('name.ilike.%.jpg,name.ilike.%.jpeg,name.ilike.%.png,name.ilike.%.gif,name.ilike.%.svg,name.ilike.%.webp');
            } else if (category === 'Videos') {
                query = query.or('name.ilike.%.mp4,name.ilike.%.mov,name.ilike.%.avi,name.ilike.%.webm');
            } else if (category === 'Audio') {
                query = query.or('name.ilike.%.mp3,name.ilike.%.wav,name.ilike.%.m4a');
            } else if (category === 'Documents') {
                // Classify by document extensions OR by the explicit 'Document' categories from UploadModal
                query = query.or('name.ilike.%.pdf,name.ilike.%.doc,name.ilike.%.docx,name.ilike.%.xls,name.ilike.%.xlsx,name.ilike.%.ppt,name.ilike.%.pptx,name.ilike.%.txt,category.eq.General Board Documents,category.eq.Meeting Minutes,category.eq.Financial Reports,category.eq.Curriculum Review');
            } else if (category === 'Research') {
                query = query.ilike('category', '%Research%');
            } else {
                // Default to simple equality for 'Others' or any other specific category
                query = query.eq('category', category);
            }

            const { data, error } = await query;

            if (error) throw error;
            if (data) {
                setCategoryItems(data.map(mapDbToFileItem));
            }
        } catch (error) {
            console.error('Error fetching by category:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSharedFiles = async (parentId: string | null = null) => {
        if (!user) return;
        setLoading(true);
        try {
            // Files not owned by me, but shared with me or everyone
            let query = supabase
                .from('files')
                .select('*, profiles(full_name, avatar_url)')
                .eq('is_deleted', false)
                .neq('user_id', user.id)
                .or(`visibility.eq.everyone,shared_with.cs.{${user.id}}`);

            if (parentId) {
                query = query.eq('parent_id', parentId);
            } else {
                // In root shared view, we want items that aren't inside another shared item 
                // (or just items without parents if we want a cleaner root)
                query = query.is('parent_id', null);
            }

            const { data, error } = await query
                .order('type', { ascending: false })
                .order('name', { ascending: true });

            if (error) throw error;
            if (data) {
                setSharedItems(data.map(mapDbToFileItem));
            }
        } catch (error) {
            console.error('Error fetching shared:', error);
        } finally {
            setLoading(false);
        }
    };

    const { createNotification } = useNotifications(); // Get notification hook

    const uploadFile = async (
        file: File,
        parentId: string | null,
        category: string,
        visibility: string,
        sharedWith: string[],
        onProgress?: (progress: number) => void
    ) => {
        if (!user) return;
        setLoading(true);

        // Progress Simulation
        let progressInterval: any;
        if (onProgress) {
            let loaded = 0;
            const totalSize = file.size;
            // Adaptive simulation: 0.5s minimum, assume 500KB/s speed
            const estimatedDuration = Math.max(500, (totalSize / (500 * 1024)) * 1000);
            const intervalTime = 100;
            const step = (totalSize / estimatedDuration) * intervalTime;

            progressInterval = setInterval(() => {
                loaded = Math.min(loaded + step, totalSize * 0.90); // Cap at 90% while waiting
                const percent = Math.round((loaded / totalSize) * 100);
                onProgress(percent);
            }, intervalTime);
        }

        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Complete Progress
            if (progressInterval) clearInterval(progressInterval);
            if (onProgress) onProgress(100);

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('files')
                .insert([{
                    name: file.name,
                    type: 'file',
                    size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                    category: category,
                    parent_id: parentId,
                    user_id: user.id,
                    url: publicUrl,
                    storage_path: filePath,
                    visibility: visibility,
                    shared_with: sharedWith,
                    is_deleted: false,
                }]);

            if (dbError) throw dbError;

            // 4. Notifications
            if (visibility === 'specific' && sharedWith.length > 0) {
                for (const recipientId of sharedWith) {
                    if (recipientId !== user.id) {
                        await createNotification(
                            recipientId,
                            'New File Shared',
                            `${profile?.full_name || user.email} shared a file with you: "${file.name}"`,
                            'file'
                        );
                    }
                }
            } else if (visibility === 'everyone') {
                const { data: allUsers } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('status', 'Active')
                    .neq('id', user.id);

                if (allUsers) {
                    for (const u of allUsers) {
                        await createNotification(
                            u.id,
                            'New Public File',
                            `${profile?.full_name || user.email} uploaded a new public file: "${file.name}"`,
                            'file'
                        );
                    }
                }
            }

            // Refresh lists
            await fetchFiles(parentId);
            await fetchRecentFiles();
            await logAction(user.id, 'Institutional Upload', 'File', fileName, { name: file.name, category });
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        } finally {
            if (progressInterval) clearInterval(progressInterval);
            setLoading(false);
        }
    };

    const createFolder = async (name: string, parentId: string | null, category: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('files')
                .insert([{
                    name: name,
                    type: 'folder',
                    category: category,
                    parent_id: parentId,
                    user_id: user.id,
                    visibility: 'everyone', // Default for folders?
                    shared_with: [],
                    is_deleted: false
                }]);

            if (error) throw error;
            await fetchFiles(parentId);
            await logAction(user.id, 'Directory Creation', 'Folder', name, { category });
        } catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    };

    // Helper to get all descendant IDs for a folder
    const getAllDescendantIds = async (folderId: string): Promise<string[]> => {
        let allIds: string[] = [];

        const { data: children } = await supabase
            .from('files')
            .select('id, type')
            .eq('parent_id', folderId);

        if (children && children.length > 0) {
            for (const child of children) {
                allIds.push(child.id);
                if (child.type === 'folder') {
                    const grandChildren = await getAllDescendantIds(child.id);
                    allIds = [...allIds, ...grandChildren];
                }
            }
        }
        return allIds;
    };

    const deleteItem = async (id: string, permanent: boolean = false) => {
        try {
            if (permanent) {
                // Fetch item details first
                const { data: item } = await supabase.from('files').select('id, storage_path, type').eq('id', id).single();
                if (!item) return;

                let idsToDelete = [id];
                let pathsToDelete: string[] = [];

                if (item.type === 'folder') {
                    const descendantIds = await getAllDescendantIds(id);
                    idsToDelete = [...idsToDelete, ...descendantIds];

                    // Fetch storage paths for all descendants
                    if (descendantIds.length > 0) {
                        const { data: descendants } = await supabase
                            .from('files')
                            .select('storage_path')
                            .in('id', descendantIds)
                            .not('storage_path', 'is', null);

                        if (descendants) {
                            pathsToDelete = descendants.map(d => d.storage_path);
                        }
                    }
                } else if (item.storage_path) {
                    pathsToDelete.push(item.storage_path);
                }

                // Delete from Storage
                if (pathsToDelete.length > 0) {
                    const { error: storageError } = await supabase.storage
                        .from('files')
                        .remove(pathsToDelete);
                    if (storageError) console.error('Error removing files from storage:', storageError);
                }

                // Delete from Database
                const { error } = await supabase.from('files').delete().in('id', idsToDelete);
                if (error) throw error;
            } else {
                // Soft Delete
                let idsToUpdate = [id];

                // If folder, find all descendants to soft delete too
                // Note: We might want to check type first to save a query if it's a file
                const { data: item } = await supabase.from('files').select('type').eq('id', id).single();

                if (item && item.type === 'folder') {
                    const descendantIds = await getAllDescendantIds(id);
                    idsToUpdate = [...idsToUpdate, ...descendantIds];
                }

                const { error } = await supabase
                    .from('files')
                    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
                    .in('id', idsToUpdate);
                if (error) throw error;
            }

            // Refresh lists
            setItems(prev => prev.filter(i => i.id !== id)); // This clears top level. 
            // If we deleted children that were visible (unlikely since we are in parent), they are gone from list too?
            // Actually recursion handles children which are not in 'items' list usually (items is current view).
            setRecentItems(prev => prev.filter(i => i.id !== id));
            fetchTrashFiles();
            if (user) {
                await logAction(user.id, permanent ? 'Permanent Destruction' : 'Directory Deletion (Soft)', 'File/Folder', id);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const restoreItem = async (id: string) => {
        try {
            let idsToRestore = [id];
            const { data: item } = await supabase.from('files').select('type').eq('id', id).single();

            if (item && item.type === 'folder') {
                const descendantIds = await getAllDescendantIds(id);
                idsToRestore = [...idsToRestore, ...descendantIds];
            }

            const { error } = await supabase
                .from('files')
                .update({ is_deleted: false, deleted_at: null })
                .in('id', idsToRestore);

            if (error) throw error;

            fetchTrashFiles();
            if (user) {
                await logAction(user.id, 'Institutional Restoration', 'File/Folder', id);
            }
            // We can't easily refresh the main list without knowing which parent folder it belonged to.
            // But next time user navigates there it will show.
            // Just in case, refresh root
            if (!item || item.type === 'folder') fetchFiles(null);
        } catch (error) {
            console.error('Error restoring item:', error);
        }
    };

    const emptyTrash = async () => {
        if (!user) return;
        try {
            // Delete permanently all items in trash
            // 1. Select IDs and paths
            const { data: trash, error: fetchError } = await supabase
                .from('files')
                .select('id, storage_path')
                .eq('is_deleted', true)
                .eq('user_id', user.id);

            if (fetchError) throw fetchError;
            if (!trash || trash.length === 0) return;

            const ids = trash.map(t => t.id);
            const paths = trash.map(t => t.storage_path).filter(p => p); // Filter out nulls/undefined

            // 2. Delete from Storage
            if (paths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('files')
                    .remove(paths as string[]);
                if (storageError) console.error('Error clearing storage:', storageError);
            }

            // 3. Delete from DB
            const { error: deleteError } = await supabase
                .from('files')
                .delete()
                .in('id', ids);

            if (deleteError) throw deleteError;
            setTrashItems([]);
            await logAction(user.id, 'Vault Cleanup (Empty Trash)', 'Trash', 'all');
        } catch (error) {
            console.error('Error emptying trash:', error);
        }
    };

    // Initial load
    useEffect(() => {
        if (user) {
            fetchFiles(currentFolderId);
            fetchRecentFiles();
            fetchTrashFiles();
        } else {
            setItems([]);
            setRecentItems([]);
            setTrashItems([]);
        }
    }, [user, currentFolderId]);

    // Realtime Sync
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('files-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'files'
                },
                (payload) => {
                    console.log('Realtime update for files:', payload);

                    // Simple strategy: re-fetch everything to ensure consistency
                    // because filters (like visibility) are handled by DB
                    fetchFiles(currentFolderId);
                    fetchRecentFiles();
                    fetchTrashFiles();
                    fetchSharedFiles();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, currentFolderId]);

    return (
        <FileContext.Provider value={{
            items,
            recentItems,
            trashItems,
            sharedItems,
            categoryItems,
            loading,
            currentFolderId,
            setCurrentFolderId,
            fetchFiles,
            fetchRecentFiles,
            fetchTrashFiles,
            fetchFilesByCategory,
            fetchSharedFiles,
            uploadFile,
            createFolder,
            deleteItem,
            restoreItem,
            emptyTrash,
            togglePin
        }}>
            {children}
        </FileContext.Provider>
    );
};

export const useFiles = () => {
    const context = useContext(FileContext);
    if (context === undefined) {
        throw new Error('useFiles must be used within a FileProvider');
    }
    return context;
};

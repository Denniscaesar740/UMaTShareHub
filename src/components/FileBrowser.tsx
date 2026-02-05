import React, { useState, useEffect } from 'react';
import FileDetailView from './FileDetailView';
import UploadModal from './UploadModal';
import PromptModal from './PromptModal';
import ConfirmModal, { type ConfirmType } from './ConfirmModal';
import { useFiles } from '../context/FileContext';
import {
    Folder,
    MoreVertical,
    ChevronRight,
    Search,
    Grid,
    List,
    FolderPlus,
    Upload,
    ArrowLeft,
    Loader2,
    Pin,
    PinOff
} from 'lucide-react';
import FileIcon from './FileIcon';
import { useAuth } from '../context/AuthContext';

const FileBrowser: React.FC = () => {
    const { items, loading, currentFolderId, setCurrentFolderId, createFolder, deleteItem, togglePin } = useFiles();
    const { user, profile } = useAuth();
    const isAdmin = profile?.role === 'Admin';
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [navigationPath, setNavigationPath] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All Types');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);

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

    // Explicitly ensure no file is selected on mount
    useEffect(() => {
        setSelectedFile(null);
    }, []);

    const handleOpenFolder = (folder: any) => {
        setNavigationPath(prev => [...prev, folder]);
        setCurrentFolderId(folder.id);
    };

    const handleGoBack = () => {
        if (navigationPath.length === 0) return;

        const newPath = [...navigationPath];
        newPath.pop();
        setNavigationPath(newPath);
        setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            setNavigationPath([]);
            setCurrentFolderId(null);
        } else {
            const newPath = navigationPath.slice(0, index + 1);
            setNavigationPath(newPath);
            setCurrentFolderId(newPath[newPath.length - 1].id);
        }
    };

    const handleCreateFolder = () => {
        setShowFolderModal(true);
    };

    const handleFolderSubmit = async (folderName: string) => {
        if (folderName) {
            try {
                await createFolder(folderName, currentFolderId, 'Uncategorized');
                setConfirmModal({
                    isOpen: true,
                    title: 'Repository Structure Updated',
                    description: `The institutional folder "${folderName}" has been successfully established in the secure repository.`,
                    type: 'success',
                    confirmText: 'Continue',
                    confirmOnly: true,
                    onConfirm: () => { }
                });
            } catch (err: any) {
                setConfirmModal({
                    isOpen: true,
                    title: 'Folder Creation Failed',
                    description: `Failed to establish folder: ${err.message || 'Check connection'}`,
                    type: 'danger',
                    confirmText: 'Close',
                    confirmOnly: true,
                    onConfirm: () => { }
                });
            }
        }
    };

    // Filter Logic
    const currentItems = items; // Already filtered by parentId in the fetchFiles call

    const filteredItems = currentItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isFile = item.type === 'file';
        const matchesType = filterType === 'All Types'
            ? true
            : filterType === 'PDF Documents' ? item.name.endsWith('.pdf')
                : filterType === 'Word Sheets' ? (item.name.endsWith('.docx') || item.name.endsWith('.doc'))
                    : filterType === 'Spreadsheets' ? (item.name.endsWith('.xlsx') || item.name.endsWith('.csv'))
                        : !isFile; // "Folders Only" isn't a type here but can be added
        return matchesSearch && matchesType;
    });

    if (selectedFile) {
        return (
            <FileDetailView
                file={selectedFile}
                onBack={() => setSelectedFile(null)}
            />
        );
    }

    return (
        <div className="main-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                    <div className="breadcrumb-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => handleBreadcrumbClick(-1)}>All Files</span>
                        {navigationPath.map((crumb, idx) => (
                            <React.Fragment key={crumb.id}>
                                <ChevronRight size={14} />
                                <span
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleBreadcrumbClick(idx)}
                                >
                                    {crumb.name}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {currentFolderId && (
                            <button
                                onClick={handleGoBack}
                                className="shadow-hover"
                                style={{
                                    background: 'var(--umat-green)',
                                    border: 'none',
                                    color: 'white',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{navigationPath.length > 0 ? navigationPath[navigationPath.length - 1].name : 'File Repository'}</h1>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn-outline" onClick={handleCreateFolder} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                        <FolderPlus size={16} />
                        <span className="hidden-mobile" style={{ marginLeft: '8px' }}>New Folder</span>
                    </button>
                    <button className="btn-primary" onClick={() => setIsUploadOpen(true)} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                        <Upload size={16} />
                        <span style={{ marginLeft: '8px' }}>{currentFolderId ? 'Upload' : 'Upload Files'}</span>
                    </button>
                    <div className="glass-card hidden-mobile" style={{ display: 'flex', borderRadius: '8px', padding: '4px' }}>
                        <button onClick={() => setViewMode('list')} style={{ padding: '6px', borderRadius: '6px', background: viewMode === 'list' ? 'var(--umat-green)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-muted)' }}><List size={18} /></button>
                        <button onClick={() => setViewMode('grid')} style={{ padding: '6px', borderRadius: '6px', background: viewMode === 'grid' ? 'var(--umat-green)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}><Grid size={18} /></button>
                    </div>
                </div>
            </header>

            <div className="glass-card flex-mobile-column" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '8px 12px', borderRadius: '8px', outline: 'none', width: '100%', maxWidth: '200px', fontSize: '0.9rem' }}
                    >
                        <option>All Types</option>
                        <option>PDF Documents</option>
                        <option>Word Sheets</option>
                        <option>Spreadsheets</option>
                    </select>
                </div>

                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search current folder..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '8px 12px 8px 40px', borderRadius: '8px', width: '100%', outline: 'none', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--umat-gold)' }}>
                    <Loader2 className="animate-spin" size={48} />
                </div>
            ) : viewMode === 'list' ? (
                <div className="glass-card" style={{ padding: '0 24px 24px 24px', minHeight: '400px', overflowX: 'hidden' }}>
                    <div className="responsive-table">
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                            <thead className="file-list-header">
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '16px 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Name</th>
                                    <th style={{ padding: '16px 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Uploaded By</th>
                                    <th style={{ padding: '16px 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Category</th>
                                    <th style={{ padding: '16px 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Size</th>
                                    <th style={{ padding: '16px 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Modified</th>
                                    <th style={{ padding: '16px 0' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    <tr
                                        className="file-list-row"
                                        key={item.id}
                                        style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer', background: item.is_pinned ? 'rgba(251, 191, 36, 0.05)' : 'transparent' }}
                                        onClick={() => item.type === 'folder' ? handleOpenFolder(item) : setSelectedFile(item)}
                                    >
                                        <td style={{ padding: '16px 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {item.type === 'folder' ?
                                                    <Folder size={20} color="var(--umat-gold)" fill="var(--umat-gold)" fillOpacity={0.2} /> :
                                                    <FileIcon name={item.name} size={20} />
                                                }
                                                <span style={{ fontWeight: 500 }}>{item.name}</span>
                                                {item.is_pinned && <Pin size={14} fill="var(--umat-gold)" color="var(--umat-gold)" style={{ transform: 'rotate(45deg)' }} />}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title={item.uploader_name}>
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
                                                    overflow: 'hidden',
                                                    flexShrink: 0
                                                }}>
                                                    {item.uploader_avatar ? (
                                                        <img src={item.uploader_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        (item.uploader_name || 'U').charAt(0)
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{item.uploader_name}</span>
                                            </div>
                                        </td>
                                        <td><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.category}</span></td>
                                        <td><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.size || '--'}</span></td>
                                        <td><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(item.updated_at || Date.now()).toLocaleDateString()}</span></td>
                                        <td style={{ padding: '16px 0', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); togglePin(item.id, item.is_pinned || false); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.is_pinned ? 'var(--umat-gold)' : 'var(--text-muted)' }}
                                                    title={item.is_pinned ? "Unpin" : "Pin"}
                                                >
                                                    {item.is_pinned ? <PinOff size={18} /> : <Pin size={18} />}
                                                </button>
                                                {(isAdmin || item.user_id === user?.id) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmModal({
                                                                isOpen: true,
                                                                title: item.type === 'folder' ? 'Remove Folder' : 'Remove Asset',
                                                                description: `Are you sure you want to move "${item.name}" to the institutional trash? It can be recovered for up to 30 days.`,
                                                                type: 'warning',
                                                                confirmText: 'Move to Trash',
                                                                onConfirm: () => deleteItem(item.id)
                                                            });
                                                        }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '80px', textAlign: 'center' }}>
                                            <Folder color="var(--glass-border)" size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
                                            <p style={{ color: 'var(--text-muted)' }}>This institutional folder is empty.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className="glass-card shadow-hover"
                            style={{ padding: '24px', textAlign: 'center', position: 'relative', cursor: 'pointer', border: item.is_pinned ? '1px solid var(--umat-gold)' : 'none' }}
                            onClick={() => item.type === 'folder' ? handleOpenFolder(item) : setSelectedFile(item)}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePin(item.id, item.is_pinned || false); }}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    color: item.is_pinned ? 'var(--umat-gold)' : 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                <Pin size={16} fill={item.is_pinned ? "currentColor" : "none"} />
                            </button>

                            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                                {item.type === 'folder' ?
                                    <Folder size={48} color="var(--umat-gold)" fill="var(--umat-gold)" fillOpacity={0.2} /> :
                                    <FileIcon name={item.name} size={48} />
                                }
                            </div>
                            <h4 style={{ fontSize: '1rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{item.type === 'folder' ? 'Folder' : item.size}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }} title={item.uploader_name}>
                                {item.uploader_avatar ? (
                                    <img
                                        src={item.uploader_avatar}
                                        alt={item.uploader_name}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--umat-gold)' }}
                                    />
                                ) : (
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--umat-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'white', fontWeight: 'bold', border: '1px solid var(--umat-gold)' }}>
                                        {item.uploader_name?.charAt(0)}
                                    </div>
                                )}
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.uploader_name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                uploadTo={items.find(i => i.id === currentFolderId)?.name}
                targetFolderId={currentFolderId}
            />

            <PromptModal
                isOpen={showFolderModal}
                onClose={() => setShowFolderModal(false)}
                onSubmit={handleFolderSubmit}
                title="Create New Folder"
                description="Enter a name for the new folder."
                placeholder="Institutional Folder Name"
                confirmText="Create Folder"
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
                    .main-content header > div:last-child {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .main-content header .btn-primary, .main-content header .btn-outline {
                        flex: 1;
                        justify-content: center;
                    }
                    .hidden-mobile {
                        display: none !important;
                    }
                    .breadcrumb-container {
                        overflow-x: auto;
                        white-space: nowrap;
                        width: 100%;
                        padding-bottom: 8px;
                    }
                    .file-list-header th:not(:first-child):not(:last-child) {
                        display: none;
                    }
                    .file-list-row td:not(:first-child):not(:last-child) {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default FileBrowser;

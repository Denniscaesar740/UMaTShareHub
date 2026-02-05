import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Grid,
    List as ListIcon,
    Clock,
    ArrowUpRight,
    Loader2,
    ChevronLeft,
    Folder
} from 'lucide-react';
import FileIcon from './FileIcon';
import { useFiles } from '../context/FileContext';
import FileDetailView from './FileDetailView';

const SharedWithMe: React.FC = () => {
    const { sharedItems, fetchSharedFiles, loading } = useFiles();
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [navStack, setNavStack] = useState<{ id: string | null, name: string }[]>([{ id: null, name: 'Root' }]);

    useEffect(() => {
        fetchSharedFiles(currentFolderId);
    }, [currentFolderId]);

    const handleItemClick = (item: any) => {
        if (item.type === 'folder') {
            setCurrentFolderId(item.id);
            setNavStack(prev => [...prev, { id: item.id, name: item.name }]);
        } else {
            setSelectedFile(item);
        }
    };

    const handleBack = () => {
        if (navStack.length > 1) {
            const newStack = [...navStack];
            newStack.pop();
            const parent = newStack[newStack.length - 1];
            setCurrentFolderId(parent.id);
            setNavStack(newStack);
        }
    };

    const filteredFiles = sharedItems.filter(file => {
        const ownerName = file.uploader_name || 'Unknown';
        return file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ownerName.toLowerCase().includes(searchQuery.toLowerCase());
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
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Shared with Me {loading && <Loader2 className="animate-spin inline-block ml-2" size={20} />}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {navStack.length > 1 ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--umat-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                    <ChevronLeft size={16} /> Back
                                </button>
                                <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
                                <span style={{ color: 'var(--text-main)' }}>{navStack[navStack.length - 1].name}</span>
                            </span>
                        ) : (
                            "Academic resources and documents shared with you by institutional colleagues."
                        )}
                    </p>
                </div>
                {navStack.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Folder size={14} /> Shared Workspace
                    </div>
                )}
            </header>

            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search shared files or owners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 48px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', background: 'var(--glass)', padding: '4px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{ padding: '8px', borderRadius: '8px', background: viewMode === 'list' ? 'var(--umat-green)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-muted)' }}
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '8px', borderRadius: '8px', background: viewMode === 'grid' ? 'var(--umat-green)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}
                        >
                            <Grid size={18} />
                        </button>
                    </div>
                    <button className="btn-outline">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div className="responsive-table">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                            <thead className="shared-table-header">
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>FILE NAME</th>
                                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SHARED BY</th>
                                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DATE SHARED</th>
                                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SIZE</th>
                                    <th style={{ padding: '16px 24px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.map((file, index) => (
                                    <tr
                                        key={index}
                                        className="shadow-hover shared-table-row"
                                        style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                        onClick={() => handleItemClick(file)}
                                    >
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ padding: '8px', background: 'rgba(0, 104, 55, 0.1)', borderRadius: '8px' }}>
                                                    <FileIcon name={file.name} size={18} />
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{file.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title={file.uploader_name}>
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
                                                    {file.uploader_avatar ? (
                                                        <img src={file.uploader_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        (file.uploader_name || 'U').charAt(0)
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.9rem' }}>{file.uploader_name || 'Unknown User'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} /> {new Date(file.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{file.size}</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {filteredFiles.map((file, index) => (
                        <div
                            key={index}
                            className="glass-card shadow-hover"
                            style={{ padding: '24px', cursor: 'pointer', position: 'relative' }}
                            onClick={() => handleItemClick(file)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ padding: '12px', background: 'rgba(0, 104, 55, 0.1)', borderRadius: '12px' }}>
                                    <FileIcon name={file.name} size={24} />
                                </div>
                                <ArrowUpRight size={18} color="var(--umat-gold)" />
                            </div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }} title={file.uploader_name}>
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
                                    {file.uploader_avatar ? (
                                        <img src={file.uploader_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (file.uploader_name || 'U').charAt(0)
                                    )}
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{file.uploader_name || 'Unknown'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{file.size}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(file.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                @media (max-width: 768px) {
                    .main-content header {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 16px;
                    }
                    .main-content header h1 {
                        font-size: 1.5rem !important;
                    }
                    .shared-table-header th:not(:first-child):not(:last-child) {
                        display: none;
                    }
                    .shared-table-row td:not(:first-child):not(:last-child) {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default SharedWithMe;

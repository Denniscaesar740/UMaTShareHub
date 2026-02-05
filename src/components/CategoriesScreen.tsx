import React, { useState, useEffect } from 'react';
import {
    Folder,
    FileText,
    Image,
    Video,
    Music,
    BookOpen,
    MoreHorizontal,
    ArrowLeft,
    Search,
    Grid,
    List as ListIcon,
    Loader2
} from 'lucide-react';
import { useFiles } from '../context/FileContext';
import FileIcon from './FileIcon';
import FileDetailView from './FileDetailView';

const CategoriesScreen: React.FC = () => {
    const { categoryItems, fetchFilesByCategory, loading } = useFiles();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<any>(null);

    const categories = [
        { id: 'Documents', label: 'Documents', icon: <FileText size={32} color="var(--umat-green)" />, color: 'rgba(0, 104, 55, 0.1)' },
        { id: 'Images', label: 'Images', icon: <Image size={32} color="#3b82f6" />, color: 'rgba(59, 130, 246, 0.1)' },
        { id: 'Videos', label: 'Videos', icon: <Video size={32} color="#ef4444" />, color: 'rgba(239, 68, 68, 0.1)' },
        { id: 'Audio', label: 'Audio', icon: <Music size={32} color="#8b5cf6" />, color: 'rgba(139, 92, 246, 0.1)' },
        { id: 'Research', label: 'Research', icon: <BookOpen size={32} color="var(--umat-gold)" />, color: 'rgba(251, 191, 36, 0.1)' },
        { id: 'Others', label: 'Others', icon: <Folder size={32} color="var(--text-muted)" />, color: 'var(--glass)' },
    ];

    useEffect(() => {
        if (selectedCategory) {
            fetchFilesByCategory(selectedCategory);
        }
    }, [selectedCategory]);

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setSearchQuery('');
    };

    const filteredFiles = categoryItems.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedFile) {
        return (
            <FileDetailView
                file={selectedFile}
                onBack={() => setSelectedFile(null)}
            />
        );
    }

    if (selectedCategory) {
        return (
            <div className="main-content">
                <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="shadow-hover"
                        style={{
                            background: 'var(--glass)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)',
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                            {selectedCategory}
                            {loading && <Loader2 className="animate-spin inline-block ml-3" size={20} />}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Browse all files in this category.</p>
                    </div>
                </header>

                <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder={`Search in ${selectedCategory}...`}
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
                    </div>
                </div>

                {categoryItems.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        <Folder size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No files found in {selectedCategory}.</p>
                    </div>
                ) : (
                    viewMode === 'list' ? (
                        <div className="glass-card" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>NAME</th>
                                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SIZE</th>
                                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>UPLOADED BY</th>
                                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DATE</th>
                                        <th style={{ padding: '16px 24px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.map((file) => (
                                        <tr
                                            key={file.id}
                                            className="shadow-hover"
                                            style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                            onClick={() => setSelectedFile(file)}
                                        >
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <FileIcon name={file.name} size={20} />
                                                    <span style={{ fontWeight: 500 }}>{file.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{file.size}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title={file.uploader_name}>
                                                    {file.uploader_avatar ? (
                                                        <img
                                                            src={file.uploader_avatar}
                                                            alt={file.uploader_name}
                                                            style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--umat-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'white' }}>
                                                            {file.uploader_name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span style={{ fontSize: '0.85rem' }}>{file.uploader_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {new Date(file.created_at || Date.now()).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <MoreHorizontal size={18} color="var(--text-muted)" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="glass-card shadow-hover"
                                    style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                                    onClick={() => setSelectedFile(file)}
                                >
                                    <div style={{ marginBottom: '12px' }}>
                                        <FileIcon name={file.name} size={48} />
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{file.size}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }} title={file.uploader_name}>
                                        {file.uploader_avatar ? (
                                            <img
                                                src={file.uploader_avatar}
                                                alt={file.uploader_name}
                                                style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--umat-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'white' }}>
                                                {file.uploader_name?.charAt(0)}
                                            </div>
                                        )}
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{file.uploader_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        );
    }

    return (
        <div className="main-content">
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Categories</h1>
                <p style={{ color: 'var(--text-muted)' }}>Organized view of your academic resources.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="glass-card shadow-hover"
                        onClick={() => handleCategoryClick(cat.id)}
                        style={{
                            padding: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '16px',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: cat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px'
                        }}>
                            {cat.icon}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{cat.label}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click to view files</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoriesScreen;

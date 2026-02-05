import React from 'react';
import { Eye, FileText, Download, Loader2 } from 'lucide-react';

interface FilePreviewProps {
    file: {
        name: string;
        url?: string;
    };
    onDownload: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onDownload }) => {
    if (!file.url) {
        return (
            <div className="glass-card" style={{
                height: 'calc(100vh - 200px)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px'
            }}>
                <div style={{ padding: '20px', borderRadius: '50%', background: 'var(--glass)', marginBottom: '16px' }}>
                    <Eye size={40} color="var(--text-muted)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Asset not accessible</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                    This asset doesn't have a valid source URL for preview.
                </p>
            </div>
        );
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const url = file.url;

    // Image Preview
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
        return (
            <div style={{ width: '100%', height: 'calc(100vh - 200px)', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                    src={url}
                    alt={file.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
            </div>
        );
    }

    // PDF Preview
    if (extension === 'pdf') {
        return (
            <div style={{ width: '100%', height: 'calc(100vh - 200px)', background: 'var(--glass)', borderRadius: '16px', overflow: 'hidden' }}>
                <iframe
                    src={`${url}#view=FitH`}
                    title={file.name}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                />
            </div>
        );
    }

    // Video Preview
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension || '')) {
        return (
            <div style={{ width: '100%', height: 'calc(100vh - 200px)', background: 'black', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video
                    controls
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                >
                    <source src={url} />
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    // Audio Preview
    if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
        return (
            <div className="glass-card" style={{ width: '100%', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 104, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-pulse" size={40} color="var(--umat-green)" />
                </div>
                <audio controls style={{ width: '80%' }}>
                    <source src={url} />
                </audio>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Playing: {file.name}</p>
            </div>
        );
    }

    // Office Documents (Word, Excel, PPT) using Google Docs Viewer
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) {
        const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
        return (
            <div style={{ width: '100%', height: 'calc(100vh - 200px)', background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
                <iframe
                    src={googleDocsUrl}
                    title={file.name}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                />
            </div>
        );
    }

    // Fallback for unsupported types
    return (
        <div className="glass-card" style={{
            height: 'calc(100vh - 200px)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px'
        }}>
            <div style={{ padding: '20px', borderRadius: '50%', background: 'var(--glass)', marginBottom: '16px' }}>
                <FileText size={40} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Preview unavailable for {extension?.toUpperCase() || 'this type'}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '300px', marginBottom: '24px' }}>
                Online preview is restricted for this institutional file format.
            </p>
            <button className="btn-primary" onClick={onDownload}>
                <Download size={18} style={{ marginRight: '8px' }} />
                Download to View
            </button>
        </div>
    );
};

export default FilePreview;

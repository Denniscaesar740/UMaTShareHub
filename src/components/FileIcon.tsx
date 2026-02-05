import React from 'react';
import {
    FileText,
    FileImage,
    FileVideo,
    FileCode,
    File as FileIconBase,
    FileSpreadsheet,
    Presentation,
    Music,
    Archive
} from 'lucide-react';

interface FileIconProps {
    name: string;
    mimeType?: string;
    size?: number;
    color?: string;
}

const getFileIcon = (name: string, mimeType?: string) => {
    const extension = name.split('.').pop()?.toLowerCase();

    // Check by extension first (most reliable for office docs)
    if (['doc', 'docx'].includes(extension || '')) return { Icon: FileText, color: '#2b579a' }; // Word Blue
    if (['xls', 'xlsx', 'csv'].includes(extension || '')) return { Icon: FileSpreadsheet, color: '#217346' }; // Excel Green
    if (['ppt', 'pptx'].includes(extension || '')) return { Icon: Presentation, color: '#d24726' }; // PowerPoint Orange
    if (['pdf'].includes(extension || '')) return { Icon: FileText, color: '#f40f02' }; // PDF Red

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) return { Icon: FileImage, color: '#e91e63' };

    // Videos
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension || '')) return { Icon: FileVideo, color: '#673ab7' };

    // Audio
    if (['mp3', 'wav', 'ogg', 'aac'].includes(extension || '')) return { Icon: Music, color: '#00bcd4' };

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) return { Icon: Archive, color: '#ff9800' };

    // Code
    if (['js', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'sql'].includes(extension || '')) return { Icon: FileCode, color: '#607d8b' };

    // Fallback based on MIME type
    if (mimeType) {
        if (mimeType.startsWith('image/')) return { Icon: FileImage, color: '#e91e63' };
        if (mimeType.startsWith('video/')) return { Icon: FileVideo, color: '#673ab7' };
        if (mimeType.startsWith('audio/')) return { Icon: Music, color: '#00bcd4' };
    }

    return { Icon: FileIconBase, color: 'var(--umat-green)' };
};

export const FileIcon: React.FC<FileIconProps> = ({ name, mimeType, size = 20, color }) => {
    const { Icon, color: defaultColor } = getFileIcon(name, mimeType);
    return <Icon size={size} color={color || defaultColor} />;
};

export default FileIcon;

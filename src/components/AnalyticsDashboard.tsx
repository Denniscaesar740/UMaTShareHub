import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    Users,
    HardDrive,
    ArrowUpRight,
    Upload,
    FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ActivityLog {
    id: string;
    user: string;
    avatar?: string;
    action: string;
    time: string;
    type: 'upload' | 'download' | 'delete' | 'update';
}

interface ChartData {
    day: string;
    count: number;
    height: number; // Percentage for CSS height
}

const AnalyticsDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalFiles: 0,
        recentUploads: 0,
        storageUsed: '0 MB'
    });
    const [loading, setLoading] = useState(true);

    const [categories, setCategories] = useState<{ label: string; count: number; color: string }[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [usageTrends, setUsageTrends] = useState<ChartData[]>([]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Fetch Total Members (Active Only)
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // 2. Fetch Files Data (Active Only for Counts, All for Storage?)
            // Actually, for "Used Space" we want EVERYTHING (Active + Trash).
            // For "Total Files" count, usually we mean active.

            // A. Fetch Active Files (for list and counts)
            const { data: files } = await supabase
                .from('files')
                .select('id, name, size, created_at, category, type, is_deleted, profiles(full_name, avatar_url)')
                .eq('is_deleted', false);

            // B. Fetch All Files (including deleted) for Storage Calc if we want strict storage
            // But to save queries, we can just query 'storage_path' or 'size' from everything?
            // Let's do a separate customized query for storage to be precise.
            const { data: allFilesValues } = await supabase
                .from('files')
                .select('size, type');

            // C. Fetch Versions (they take space too!)
            const { data: versions } = await supabase
                .from('file_versions')
                .select('size');

            if (!files) return;

            // --- Filter only actual Files for logic ---
            const validActiveFiles = files.filter(f => f.type === 'file');

            // --- Calculate Stats ---
            const totalFiles = validActiveFiles.length;

            // --- Storage Calculation Helper ---
            const parseSizeToMB = (sizeStr: string | null) => {
                if (!sizeStr) return 0;
                const parts = sizeStr.split(' ');
                let val = parseFloat(parts[0]);
                if (isNaN(val)) return 0;
                const unit = parts[1]?.toUpperCase();

                if (unit === 'KB' || unit === 'K') val = val / 1024;
                else if (unit === 'GB' || unit === 'G') val = val * 1024;
                else if (unit === 'TB' || unit === 'T') val = val * 1024 * 1024;
                // Default is MB
                return val;
            };

            // Calculate Total Storage (Files + Versions)
            let totalSizeMB = 0;

            // Sum all files (active + deleted)
            if (allFilesValues) {
                allFilesValues.forEach(f => {
                    if (f.type === 'file') totalSizeMB += parseSizeToMB(f.size);
                });
            }

            // Sum versions
            if (versions) {
                versions.forEach(v => totalSizeMB += parseSizeToMB(v.size));
            }

            // Recent Uploads (Last 24h) - Based on Active Files
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            const recentUploadsCount = validActiveFiles.filter(f => new Date(f.created_at) > oneDayAgo).length;

            setStats({
                totalMembers: userCount || 0,
                totalFiles: totalFiles,
                recentUploads: recentUploadsCount,
                storageUsed: totalSizeMB < 1024
                    ? `${totalSizeMB.toFixed(2)} MB`
                    : `${(totalSizeMB / 1024).toFixed(2)} GB`
            });

            // --- Category Distribution ---
            const catCounts: Record<string, number> = {};
            validActiveFiles.forEach(f => {
                const c = f.category || 'Uncategorized';
                catCounts[c] = (catCounts[c] || 0) + 1;
            });

            // Define known categories colors or generate
            const catColors: Record<string, string> = {
                'General Board Documents': 'var(--umat-gold)',
                'Meeting Minutes': '#3b82f6',
                'Financial Reports': '#8b5cf6',
                'Academic': '#94a3b8',
                'Uncategorized': 'var(--umat-green)'
            };

            const sortedCategories = Object.entries(catCounts)
                .map(([label, count]) => ({
                    label,
                    count,
                    color: catColors[label] || '#cbd5e1'
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5); // Top 5

            setCategories(sortedCategories);

            // --- Usage Trends (Last 7 Days - Files only) ---
            const trends: ChartData[] = [];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            let maxCount = 1; // Avoid divide by zero

            // Initialize last 7 days buckets
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dayLabel = days[d.getDay()];
                // Count uploads for this day
                const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

                const count = validActiveFiles.filter(f => {
                    const fDate = new Date(f.created_at);
                    return fDate >= startOfDay && fDate < endOfDay;
                }).length;

                if (count > maxCount) maxCount = count;

                trends.push({
                    day: dayLabel,
                    count,
                    height: 0 // Will calculate after loop
                });
            }

            // Normalize heights
            trends.forEach(t => t.height = maxCount > 0 ? (t.count / maxCount) * 100 : 0);
            setUsageTrends(trends);

            // --- Recent Activity Stream ---
            // Sort by created_at desc
            const sortedFiles = [...files].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

            const activity: ActivityLog[] = sortedFiles.map((f: any) => ({
                id: f.id,
                user: f.profiles?.full_name || 'System',
                avatar: f.profiles?.avatar_url,
                action: `uploaded ${f.name}`,
                time: new Date(f.created_at).toLocaleString(),
                type: 'upload'
            }));

            setRecentActivity(activity);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();

        // Realtime sync for Analytics
        const userChannel = supabase.channel('analytics-users')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAnalytics())
            .subscribe();

        const fileChannel = supabase.channel('analytics-files')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, () => fetchAnalytics())
            .subscribe();

        return () => {
            supabase.removeChannel(userChannel);
            supabase.removeChannel(fileChannel);
        };
    }, []);

    return (
        <div className="main-content">
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Portal Analytics</h1>
                <p style={{ color: 'var(--text-muted)' }}>Detailed insights into UMAT ShareHub engagement and storage metrics. {loading && '(Updating...)'}</p>
            </header>

            {/* Top Level KPIs */}
            <div className="stats-grid">
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(0, 107, 63, 0.1)' }}>
                            <Users color="var(--umat-green)" size={24} />
                        </div>
                        {/* Static trend for now as we don't have historical snapshots */}
                        <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                            <ArrowUpRight size={14} /> Active
                        </span>
                    </div>
                    <h3 style={{ fontSize: '1.8rem', margin: '0 0 4px 0' }}>{stats.totalMembers}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Total Members</p>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)' }}>
                            <HardDrive color="var(--umat-gold)" size={24} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            Used Space
                        </span>
                    </div>
                    <h3 style={{ fontSize: '1.8rem', margin: '0 0 4px 0' }}>{stats.storageUsed}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Encrypted Cloud Storage</p>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)' }}>
                            <FileText color="#3b82f6" size={24} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                            <ArrowUpRight size={14} /> {stats.totalFiles} Total
                        </span>
                    </div>
                    <h3 style={{ fontSize: '1.8rem', margin: '0 0 4px 0' }}>{stats.totalFiles}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Documents Managed</p>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)' }}>
                            <Upload color="#8b5cf6" size={24} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            Last 24h
                        </span>
                    </div>
                    <h3 style={{ fontSize: '1.8rem', margin: '0 0 4px 0' }}>{stats.recentUploads}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>New Files</p>
                </div>
            </div>

            <div className="flex-mobile-column" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
                {/* Activity Chart Real Data */}
                <div className="glass-card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <TrendingUp size={20} color="var(--umat-green)" /> Upload Trends
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last 7 Days</span>
                    </div>

                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '20px', position: 'relative' }}>
                        {/* Grid Lines */}
                        <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
                            {[1, 2, 3, 4].map(i => <div key={i} style={{ borderBottom: '1px dashed var(--glass-border)', width: '100%' }} />)}
                        </div>

                        {/* Dynamic Bars */}
                        {usageTrends.map((data, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, width: '10%' }} title={`${data.count} uploads`}>
                                <div style={{
                                    height: `${data.height}%`,
                                    minHeight: '4px', // Ensure visible even if 0
                                    width: '100%',
                                    background: `linear-gradient(to top, var(--umat-green), var(--umat-gold))`,
                                    borderRadius: '6px 6px 0 0',
                                    opacity: 0.9,
                                    transition: 'height 0.5s ease-out'
                                }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="glass-card" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '30px' }}>Content Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {categories.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No file data available yet.</p>
                        ) : (
                            categories.map((cat, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <span>{cat.label}</span>
                                        <span style={{ fontWeight: 600 }}>{cat.count}</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--glass)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${(cat.count / stats.totalFiles) * 100}%`,
                                            height: '100%',
                                            background: cat.color,
                                            borderRadius: '10px',
                                            transition: 'width 0.5s ease-out'
                                        }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-mobile-column" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
                {/* Live Logs - Now Real */}
                <div className="glass-card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Latest Activity</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--umat-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', background: 'var(--umat-green)', borderRadius: '50%', boxShadow: '0 0 5px var(--umat-green)' }} />
                            LIVE
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentActivity.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No recent activity to show.</p>
                        ) : (
                            recentActivity.map((log) => (
                                <div key={log.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(0, 107, 63, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {log.avatar ? (
                                            <img src={log.avatar} alt={log.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Upload size={18} color="var(--umat-green)" />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}><span style={{ fontWeight: 600 }}>{log.user}</span> {log.action}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Summary Card */}
                <div className="glass-card" style={{
                    padding: '40px',
                    background: 'linear-gradient(135deg, var(--umat-green-dark), transparent)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'var(--umat-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        boxShadow: '0 0 30px rgba(251, 191, 36, 0.3)'
                    }}>
                        <TrendingUp size={40} color="var(--bg-dark)" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>Performance Summary</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '300px' }}>
                        System is running smoothy. {stats.recentUploads} new files added in the last 24 hours.
                    </p>
                    {/* Placeholder action */}
                    <button className="btn-primary">Download Report</button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;

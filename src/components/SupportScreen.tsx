import React from 'react';
import {
    Book,
    MessageCircle,
    Video,
    Search,
    ExternalLink,
    ChevronRight
} from 'lucide-react';

const SupportScreen: React.FC = () => {
    const faqs = [
        { q: "How do I share files with members outside the board?", a: "Sharing is restricted to institutional roles. You can generate a temporary secure link via the File Details panel." },
        { q: "What is the maximum file size for uploads?", a: "Individual files can be up to 50MB. Bulk uploads are capped at 500MB total per session." },
        { q: "How do I recover a deleted file?", a: "Navigate to the 'Trash' tab in the sidebar. Files are kept for 30 days before permanent deletion." },
        { q: "Can I annotate PDFs directly in the browser?", a: "Yes, open any PDF and use the 'Annotate' toolbar at the top of the preview window." },
    ];

    return (
        <div className="main-content">
            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>How can we <span style={{ color: 'var(--umat-gold)' }}>help you?</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Search our knowledge base or contact the UMAT IT support desk for institutional assistance.
                </p>
                <div style={{ position: 'relative', maxWidth: '600px', margin: '32px auto 0 auto' }}>
                    <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search for guides, FAQs, or tutorials..."
                        style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '16px 16px 16px 56px', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }}
                    />
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0, 104, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                        <Book color="var(--umat-green)" size={24} />
                    </div>
                    <h3 style={{ marginBottom: '12px' }}>Documentation</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Comprehensive guides on all ShareHub features.</p>
                    <button className="btn-outline" style={{ width: '100%' }}>Browse Guides</button>
                </div>
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                        <Video color="var(--umat-gold)" size={24} />
                    </div>
                    <h3 style={{ marginBottom: '12px' }}>Video Tutorials</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Short walkthroughs for board members.</p>
                    <button className="btn-outline" style={{ width: '100%' }}>Watch Now</button>
                </div>
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0, 45, 98, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                        <MessageCircle color="var(--umat-navy)" size={24} />
                    </div>
                    <h3 style={{ marginBottom: '12px' }}>Live Support</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Chat with the IT services command center.</p>
                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Start Chat</button>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Frequently Asked Questions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {faqs.map((faq, i) => (
                        <div key={i} className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{faq.q}</h4>
                                <ChevronRight size={18} color="var(--text-muted)" />
                            </div>
                            <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '64px', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                <h3 style={{ marginBottom: '8px' }}>Still need help?</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Our technical team is available Monday - Friday, 8:00 AM - 5:00 PM GMT.</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button className="btn-outline">
                        <ExternalLink size={16} style={{ marginRight: '8px' }} />
                        Open Ticket
                    </button>
                    <button className="btn-outline">Email Support</button>
                </div>
            </div>
        </div>
    );
};

export default SupportScreen;

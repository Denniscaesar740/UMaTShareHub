import React from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
    return (
        <div className="glass-panel" style={{
            padding: '40px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}>
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '24px',
                color: 'var(--primary)'
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{description}</p>
        </div>
    );
};

export default FeatureCard;

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, HelpCircle } from 'lucide-react';

export type ConfirmType = 'danger' | 'warning' | 'info' | 'question' | 'success';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmType;
    confirmOnly?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'question',
    confirmOnly = false
}) => {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus confirm button by default for quick action, or cancel if dangerous?
            // Usually safest to focus cancel for danger, confirm for others.
            setTimeout(() => {
                confirmButtonRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle size={32} color="#ef4444" />;
            case 'warning': return <AlertTriangle size={32} color="#f59e0b" />;
            case 'success': return <CheckCircle size={32} color="#10b981" />; // success type not strictly in type definition but useful
            case 'info': return <Info size={32} color="#3b82f6" />;
            default: return <HelpCircle size={32} color="var(--umat-gold)" />;
        }
    };

    const getConfirmButtonStyle = () => {
        switch (type) {
            case 'danger':
                return { background: '#ef4444', color: 'white', border: 'none' };
            case 'warning':
                return { background: '#f59e0b', color: 'black', border: 'none' };
            default: // question / info
                return { background: 'var(--umat-green)', color: 'white', border: 'none' };
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1050,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(5px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="glass-card"
                        style={{
                            width: '100%',
                            maxWidth: '450px',
                            padding: '30px',
                            background: 'var(--bg-modal)',
                            border: '1px solid var(--glass-border)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px'
                            }}>
                                {getIcon()}
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'var(--text-main)' }}>{title}</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{description}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            {!confirmOnly && (
                                <button
                                    onClick={onClose}
                                    className="btn-outline"
                                    style={{ padding: '10px 24px', flex: 1 }}
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                ref={confirmButtonRef}
                                onClick={handleConfirm}
                                style={{
                                    padding: '10px 24px',
                                    flex: 1,
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'filter 0.2s',
                                    ...getConfirmButtonStyle()
                                }}
                                onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;

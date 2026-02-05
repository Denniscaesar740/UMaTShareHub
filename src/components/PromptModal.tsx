import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void;
    title: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    requireInput?: boolean;
}

const PromptModal: React.FC<PromptModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    placeholder,
    defaultValue = '',
    confirmText = 'Confirm',
    requireInput = true
}) => {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset value when modal opens
    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, defaultValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (requireInput && !value.trim()) return;
        onSubmit(value);
        onClose();
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
                    zIndex: 1000,
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
                            maxWidth: '400px',
                            padding: '30px',
                            background: 'var(--bg-modal)',
                            border: '1px solid var(--glass-border)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: 'var(--text-main)' }}>{title}</h3>
                        {description && <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{description}</p>}

                        <form onSubmit={handleSubmit}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-dark)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    marginBottom: '24px'
                                }}
                                autoFocus
                            />

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn-outline"
                                    style={{ padding: '10px 20px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ padding: '10px 20px' }}
                                    disabled={requireInput && !value.trim()}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PromptModal;

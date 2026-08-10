import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: 'Are you sure?',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger', // 'danger' | 'primary'
    resolve: null
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      let config = {
        title: 'Confirmation',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger'
      };

      if (typeof options === 'string') {
        config.message = options;
      } else if (typeof options === 'object' && options !== null) {
        config = { ...config, ...options };
      }

      setConfirmState({
        isOpen: true,
        ...config,
        resolve
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmState.resolve) confirmState.resolve(true);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (confirmState.resolve) confirmState.resolve(false);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {confirmState.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '440px',
            width: '100%',
            overflow: 'hidden',
            border: '1px solid var(--border-color, #e5e7eb)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color, #f3f4f6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: confirmState.type === 'danger' ? '#fee2e2' : '#e0e7ff',
                  color: confirmState.type === 'danger' ? '#ef4444' : '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-main, #111827)' }}>
                  {confirmState.title}
                </h3>
              </div>
              <button
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary, #9ca3af)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', color: 'var(--text-secondary, #4b5563)', fontSize: '14px', lineHeight: '1.5' }}>
              {confirmState.message}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              padding: '12px 20px',
              backgroundColor: 'var(--bg-main, #f9fafb)',
              borderTop: '1px solid var(--border-color, #f3f4f6)'
            }}>
              <button
                onClick={handleCancel}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                {confirmState.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={confirmState.type === 'danger' ? 'btn-danger' : 'btn-primary'}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

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
        <div className="modal-backdrop-custom" onClick={handleCancel}>
          <div className="modal-card-custom" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '7px',
                  borderRadius: '8px',
                  backgroundColor: confirmState.type === 'danger' ? '#fee2e2' : 'rgba(244, 122, 32, 0.1)',
                  color: confirmState.type === 'danger' ? '#dc2626' : 'var(--palette-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={18} />
                </div>
                <h3 className="modal-title-custom">
                  {confirmState.title}
                </h3>
              </div>
              <button
                onClick={handleCancel}
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-custom" style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              {confirmState.message}
            </div>

            <div className="modal-footer-custom">
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                {confirmState.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={confirmState.type === 'danger' ? 'btn-danger' : 'btn-primary'}
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

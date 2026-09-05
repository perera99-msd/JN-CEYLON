import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ title }) => {
  const { user, setIsSearchModalOpen } = useAuth();
  const initials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JN';

  return (
    <header className="header-bar no-print">
      <h1 className="page-title">{title || 'Dashboard'}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '7px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Search anything (Ctrl+K)"
        >
          <Search size={16} color="var(--palette-orange)" />
          <span style={{ display: 'inline-block' }}>Search ERP...</span>
          <kbd style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
          }}>
            Ctrl+K
          </kbd>
        </button>

        <div className="user-profile">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.fullName || 'JN Ceylon Admin'}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.role || 'Administrator'}</div>
          </div>
          <div className="user-avatar">{initials}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;

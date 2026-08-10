import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ title }) => {
  const { user } = useAuth();
  const initials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JN';

  return (
    <header className="header-bar no-print">
      <h1 className="page-title">{title || 'Dashboard'}</h1>
      <div className="user-profile">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.fullName || 'JN Ceylon Admin'}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.role || 'Administrator'}</div>
        </div>
        <div className="user-avatar">{initials}</div>
      </div>
    </header>
  );
};

export default Header;

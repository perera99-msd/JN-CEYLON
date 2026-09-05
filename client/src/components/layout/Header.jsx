import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';

const Header = ({ title }) => {
  const { user, setIsSearchModalOpen } = useAuth();

  return (
    <header className="header-bar no-print">
      <h1 className="page-title" title={title || 'Dashboard'}>
        {title || 'Dashboard'}
      </h1>

      <div className="header-right-controls">
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="header-search-btn"
          title="Search anything (Ctrl+K)"
        >
          <Search size={16} color="var(--palette-orange)" style={{ flexShrink: 0 }} />
          <span>Search ERP...</span>
          <kbd className="header-search-kbd">
            Ctrl+K
          </kbd>
        </button>

        <div className="user-profile">
          <div className="user-profile-info">
            <div className="user-profile-name" title={user?.fullName || user?.username || 'JN Ceylon Admin'}>
              {user?.fullName || user?.username || 'JN Ceylon Admin'}
            </div>
            <div className="user-profile-role">
              {user?.role === 'ADMIN' ? 'ADMIN' : 'STAFF'}
            </div>
          </div>
          <UserAvatar 
            avatarId={user?.avatar || 'avatar-1'} 
            name={user?.fullName || user?.username || 'Admin'} 
            size={40} 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;


import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  FileSpreadsheet, 
  CreditCard, 
  Building2, 
  Trash2,
  Settings,
  Shield,
  User,
  LogOut,
  History,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout, setIsPasswordModalOpen } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/quotations', label: 'Quotations', icon: FileText },
    { path: '/invoices', label: 'Invoices', icon: Receipt },
    { path: '/statements', label: 'Account Statements', icon: FileSpreadsheet },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/companies', label: 'Companies', icon: Building2 },
    { path: '/activity', label: 'Activity Log', icon: History },
    { path: '/recycle-bin', label: 'Recycle Bin', icon: Trash2 },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ path: '/settings', label: 'Settings', icon: Settings });
  }

  return (
    <aside className="sidebar-container no-print">
      <div className="sidebar-logo">
        <img src="/Logo.png" alt="JN Ceylon" onError={(e) => { e.target.src = '/logo.png'; }} />
        <div className="sidebar-logo-text">
          JN <span>CEYLON</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: user.role === 'ADMIN' ? 'rgba(244, 122, 32, 0.2)' : 'var(--bg-main)',
              color: user.role === 'ADMIN' ? 'var(--palette-orange)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {user.role === 'ADMIN' ? <Shield size={16} /> : <User size={16} />}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.fullName || user.username}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {user.role} USER
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', margin: 0 }}
        >
          <KeyRound size={18} />
          <span>Change Password</span>
        </button>

        <button
          onClick={logout}
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', margin: 0 }}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

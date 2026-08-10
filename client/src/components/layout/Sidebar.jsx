import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  FileSpreadsheet, 
  CreditCard, 
  Building2, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/quotations', label: 'Quotations', icon: FileText },
    { path: '/invoices', label: 'Invoices', icon: Receipt },
    { path: '/statements', label: 'Account Statements', icon: FileSpreadsheet },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/companies', label: 'Companies', icon: Building2 },
  ];

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

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={logout}
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

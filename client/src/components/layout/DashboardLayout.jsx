import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

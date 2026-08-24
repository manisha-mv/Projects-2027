// layouts/AppLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const COLLAPSED_KEY = 'neo_hms_sidebar_collapsed';

const AppLayout = () => {
  const [collapsed, setCollapsed]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(COLLAPSED_KEY)) ?? false; }
    catch { return false; }
  });
  const [mobileOpen, setMobileOpen]   = useState(false);

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 768 && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [mobileOpen]);

  const toggleSidebar   = () => setCollapsed(v => !v);
  const openMobileMenu  = () => setMobileOpen(true);
  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobileMenu}
      />

      {/* Main */}
      <div className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <Topbar onMobileMenuOpen={openMobileMenu} />

        {/* Scrollable Content Area */}
        <main className="page-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiMenuLine,
  RiHeartPulseLine,
  RiRefreshLine,
  RiFirstAidKitLine,
  RiTimeLine,
} from 'react-icons/ri';
import GlobalSearch from '../components/common/GlobalSearch';
import NotificationPanel from '../components/common/NotificationPanel';
import UserProfileMenu from '../components/common/UserProfileMenu';
import { mockShiftInfo } from '../data/mockData';

const Topbar = ({ onMobileMenuOpen }) => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <header className="topbar" role="banner">
      {/* Mobile: hamburger + brand */}
      <div className="topbar-left">
        <button
          id="mobile-menu-btn"
          className="btn-icon topbar-mobile-menu"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
        >
          <RiMenuLine size={20} />
        </button>

        {/* Mobile brand (hidden on desktop - sidebar shows it) */}
        <div className="topbar-brand-mobile">
          <RiHeartPulseLine size={16} color="var(--color-primary)" />
          <span className="topbar-brand-name">NEO-HMS</span>
        </div>
      </div>

      {/* Shift context pill — desktop only */}
      <div className="topbar-context-bar">
        <div className="topbar-shift-pill">
          <span className="topbar-shift-dot" />
          <span className="topbar-shift-text">{mockShiftInfo.shift} Shift</span>
          <span className="topbar-shift-sep">·</span>
          <RiTimeLine size={13} />
          <span className="topbar-shift-time">{mockShiftInfo.shiftStart}–{mockShiftInfo.shiftEnd}</span>
        </div>
        <div className="topbar-census-chip">
          <span className="topbar-census-num">{mockShiftInfo.census.totalInpatients}</span>
          <span className="topbar-census-label">Inpatients</span>
        </div>
        <div className="topbar-date-chip">
          <RiTimeLine size={12} />
          <span>{today}</span>
        </div>
      </div>

      {/* Global Search */}
      <div className="topbar-search-wrap">
        <GlobalSearch />
      </div>

      {/* Right actions */}
      <div className="topbar-actions">
        {/* Emergency quick-launch */}
        <button
          id="topbar-emergency-btn"
          className="topbar-emergency-btn"
          title="Emergency Registration"
          aria-label="Emergency Registration"
          onClick={() => navigate('/emergency')}
        >
          <RiFirstAidKitLine size={15} />
          <span className="topbar-emergency-label">Emergency</span>
        </button>

        <button
          id="topbar-refresh-btn"
          className="btn-icon"
          title="Refresh data"
          aria-label="Refresh data"
          onClick={() => window.location.reload()}
        >
          <RiRefreshLine size={18} />
        </button>

        <NotificationPanel />
        <div className="topbar-divider" />
        <UserProfileMenu />
      </div>
    </header>
  );
};

export default Topbar;

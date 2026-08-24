import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiUserLine,
  RiSettings3Line,
  RiLockPasswordLine,
  RiLogoutBoxLine,
  RiArrowDownSLine,
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { StatusDot } from '../ui/Badge';

const UserProfileMenu = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menuItems = [
    { id: 'profile',   label: 'My Profile',        icon: <RiUserLine size={15} />,         action: () => navigate('/settings') },
    { id: 'settings',  label: 'My Settings',        icon: <RiSettings3Line size={15} />,    action: () => navigate('/settings') },
    { id: 'password',  label: 'Change Password',    icon: <RiLockPasswordLine size={15} />, action: () => addToast({ type: 'info', title: 'Change Password', message: 'You can update your password in Settings → Staff Account.' }) },
    { divider: true },
    { id: 'logout',    label: 'Sign Out',           icon: <RiLogoutBoxLine size={15} />,    danger: true, action: () => logout() },
  ];

  return (
    <div className="user-menu-wrap" ref={ref}>
      <button
        id="user-profile-btn"
        className="user-menu-trigger"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="user-avatar-wrap">
          <Avatar name={user?.name || 'User'} size="sm" />
          <StatusDot status="online" />
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name || 'User'}</span>
          <span className="user-role">{user?.role || 'Role'}</span>
        </div>
        <RiArrowDownSLine
          size={15}
          className="user-chevron"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
        />
      </button>

      {open && (
        <div className="user-dropdown" role="menu" aria-label="User options">
          {/* Profile Header */}
          <div className="user-dropdown-header">
            <Avatar name={user?.name || 'User'} size="lg" />
            <div>
              <div className="user-dropdown-name">{user?.name || 'User'}</div>
              <div className="user-dropdown-dept">{user?.role || 'Department'}</div>
              <div className="user-dropdown-email">{user?.email || 'email@hospital.com'}</div>
            </div>
          </div>

          <div className="dropdown-divider" />

          {/* Menu Items */}
          {menuItems.map((item, i) => {
            if (item.divider) return <div key={`div-${i}`} className="dropdown-divider" />;
            return (
              <button
                key={item.id}
                id={`user-menu-${item.id}`}
                className={`dropdown-item ${item.danger ? 'danger' : ''}`}
                onClick={() => { item.action(); setOpen(false); }}
                role="menuitem"
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiBellLine,
  RiFlaskLine,
  RiCalendarLine,
  RiMedicineBottleLine,
  RiAlertLine,
  RiFirstAidKitLine,
  RiCheckDoubleLine,
} from 'react-icons/ri';
import { mockNotifications } from '../../data/mockData';

const ICON_MAP = {
  clinical:    { icon: <RiFirstAidKitLine size={15} />,    bg: 'var(--color-primary-light)',   color: 'var(--color-primary)' },
  appointment: { icon: <RiCalendarLine size={15} />,       bg: 'var(--color-info-light)',      color: 'var(--color-info)' },
  pharmacy:    { icon: <RiMedicineBottleLine size={15} />, bg: 'var(--color-secondary-light)', color: 'var(--color-secondary)' },
  laboratory:  { icon: <RiFlaskLine size={15} />,          bg: 'var(--color-warning-light)',   color: 'var(--color-warning)' },
  emergency:   { icon: <RiAlertLine size={15} />,          bg: 'var(--color-error-light)',     color: 'var(--color-error)' },
  system:      { icon: <RiCheckDoubleLine size={15} />,    bg: 'var(--color-bg)',              color: 'var(--color-text-secondary)' },
};

const NotificationPanel = () => {
  const navigate = useNavigate();
  const [open, setOpen]   = useState(false);
  const [notifs, setNotifs] = useState(mockNotifications);
  const ref = useRef(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="notification-wrap" ref={ref}>
      <button
        id="notification-btn"
        className="btn-icon topbar-action-btn"
        onClick={() => setOpen(v => !v)}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <RiBellLine size={19} />
        {unread > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications">
          <div className="notif-header">
            <span className="notif-header-title">Notifications</span>
            {unread > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                <RiCheckDoubleLine size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifs.length === 0 ? (
              <div className="notif-empty">
                <RiBellLine size={28} />
                <p>No notifications</p>
              </div>
            ) : (
              notifs.map(n => {
                const cfg = ICON_MAP[n.icon] || ICON_MAP.appointment;
                return (
                  <button
                    key={n.id}
                    className={`notif-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  >
                    <span
                      className="notif-icon"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon}
                    </span>
                    <span className="notif-content">
                      <span className="notif-title">{n.title}</span>
                      <span className="notif-message">{n.message}</span>
                      <span className="notif-time">{n.time}</span>
                    </span>
                    {!n.read && <span className="notif-unread-dot" aria-label="Unread" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="notif-footer">
            <button
              className="notif-view-all"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;

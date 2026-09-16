// pages/Notifications/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiNotification3Line, RiCheckDoubleLine, RiRefreshLine,
  RiFlaskLine, RiCalendarCheckLine, RiMedicineBottleLine,
  RiAlertLine, RiFirstAidKitLine, RiFileTextLine,
  RiUserFollowLine, RiLogoutBoxLine, RiShieldCheckLine,
  RiSettings3Line, RiCircleFill, RiMailOpenLine,
  RiDeleteBin6Line, RiExternalLinkLine, RiTimeLine,
} from 'react-icons/ri';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/common/PageHeader';

// ── Notification type config ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  lab:         { icon: <RiFlaskLine size={18} />,            color: '#F59E0B', bg: '#FEF9C3', label: 'Laboratory' },
  appointment: { icon: <RiCalendarCheckLine size={18} />,    color: '#2563EB', bg: '#DBEAFE', label: 'Appointment' },
  pharmacy:    { icon: <RiMedicineBottleLine size={18} />,   color: '#7C3AED', bg: '#EDE9FE', label: 'Pharmacy' },
  complaint:   { icon: <RiAlertLine size={18} />,            color: '#DC2626', bg: '#FEE2E2', label: 'Complaint' },
  emergency:   { icon: <RiFirstAidKitLine size={18} />,      color: '#EF4444', bg: '#FEE2E2', label: 'Emergency' },
  radiology:   { icon: <RiFileTextLine size={18} />,         color: '#0284C7', bg: '#E0F2FE', label: 'Radiology' },
  medication:  { icon: <RiMedicineBottleLine size={18} />,   color: '#0D9488', bg: '#CCFBF1', label: 'Medication' },
  lowstock:    { icon: <RiAlertLine size={18} />,            color: '#EA580C', bg: '#FED7AA', label: 'Low Stock' },
  followup:    { icon: <RiUserFollowLine size={18} />,       color: '#64748B', bg: '#F1F5F9', label: 'Follow-up' },
  discharge:   { icon: <RiLogoutBoxLine size={18} />,        color: '#475569', bg: '#F1F5F9', label: 'Discharge' },
  system:      { icon: <RiSettings3Line size={18} />,        color: '#64748B', bg: '#F8FAFC', label: 'System' },
};

const ALL_FILTER_TYPES = ['All', 'lab', 'appointment', 'pharmacy', 'complaint', 'emergency', 'radiology', 'medication', 'lowstock', 'followup', 'system'];

const timeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationsPage() {
  const { role } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [readFilter, setReadFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications(role);
      setNotifications(res.notifications || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 15000);
    return () => clearInterval(iv);
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead(role);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast({ type: 'success', title: 'All Marked Read', message: 'All notifications marked as read.' });
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    }
  };

  // ── Derived counts & filtered list ───────────────────────────────────────
  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    const matchType = typeFilter === 'All' || n.type === typeFilter;
    const matchRead = readFilter === 'all' || (readFilter === 'unread' ? !n.read : n.read);
    return matchType && matchRead;
  });

  // Group by today vs earlier
  const today = new Date().toDateString();
  const todayItems    = filtered.filter(n => new Date(n.timestamp).toDateString() === today);
  const earlierItems  = filtered.filter(n => new Date(n.timestamp).toDateString() !== today);

  const NotifCard = ({ notif }) => {
    const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          padding: '14px 18px',
          background: notif.read ? 'var(--color-surface)' : 'var(--color-surface-alt)',
          borderRadius: 'var(--radius-lg)',
          border: `1.5px solid ${notif.read ? 'var(--color-border)' : cfg.color + '33'}`,
          transition: 'all 0.15s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Unread accent bar */}
        {!notif.read && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            background: cfg.color, borderRadius: '3px 0 0 3px',
          }} />
        )}

        {/* Type Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: cfg.bg, color: cfg.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {cfg.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: notif.read ? 600 : 700, fontSize: 14, color: 'var(--color-text-primary)' }}>
              {notif.title}
            </span>
            {!notif.read && (
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: cfg.color, flexShrink: 0, display: 'inline-block',
              }} />
            )}
            <Badge
              variant="secondary"
              size="sm"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}22` }}
            >
              {cfg.label}
            </Badge>
          </div>

          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            {notif.message}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <RiTimeLine size={12} />
              {timeAgo(notif.timestamp)}
            </span>
            {notif.forRoles && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                For: {notif.forRoles.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          {notif.link && (
            <Button variant="ghost" size="sm" onClick={() => window.location.href = notif.link} title="Go to module">
              <RiExternalLinkLine size={14} />
            </Button>
          )}
          {!notif.read && (
            <Button variant="outline" size="sm" onClick={() => handleMarkRead(notif.id)}>
              <RiMailOpenLine size={14} /> Mark Read
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="module-page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Notifications Center
            {unreadCount > 0 && (
              <span style={{
                background: '#DC2626', color: '#fff',
                fontSize: 11, fontWeight: 700, padding: '2px 8px',
                borderRadius: 99, lineHeight: 1.8,
              }}>
                {unreadCount} Unread
              </span>
            )}
          </div>
        }
        description="Role-based alert notifications, clinical updates, and system messages — auto-refreshes every 15 seconds"
        primaryAction={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
              <RiRefreshLine className={loading ? 'spin' : ''} size={15} /> Refresh
            </Button>
            <Button variant="primary" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              <RiCheckDoubleLine size={15} /> Mark All Read
            </Button>
          </div>
        }
      />

      {/* ── KPI Strip ───────────────────────────────────────────────────── */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
            <RiNotification3Line size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Notifications</div>
            <div className="stat-pill-value">{notifications.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <RiCircleFill size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Unread</div>
            <div className="stat-pill-value" style={{ color: '#DC2626' }}>{unreadCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <RiCheckDoubleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Read</div>
            <div className="stat-pill-value" style={{ color: '#16A34A' }}>{notifications.length - unreadCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Today</div>
            <div className="stat-pill-value">{todayItems.length}</div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <div className="module-filter-bar" style={{ flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {ALL_FILTER_TYPES.map(t => {
            const cfg = TYPE_CONFIG[t] || {};
            const isActive = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 99,
                  border: isActive ? `1.5px solid ${cfg.color || 'var(--color-primary)'}` : '1.5px solid var(--color-border)',
                  background: isActive ? (cfg.bg || 'var(--color-primary-light)') : 'transparent',
                  color: isActive ? (cfg.color || 'var(--color-primary)') : 'var(--color-text-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.15s',
                }}
              >
                {t !== 'All' && cfg.icon}
                {t === 'All' ? 'All Types' : cfg.label || t}
              </button>
            );
          })}
        </div>
        <div className="module-filters-group" style={{ marginLeft: 'auto' }}>
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setReadFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                border: readFilter === f ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                background: readFilter === f ? 'var(--color-primary-light)' : 'transparent',
                color: readFilter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {f === 'all' ? 'All' : f === 'unread' ? `Unread (${unreadCount})` : 'Read'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="loading-center" style={{ minHeight: 240 }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<RiNotification3Line />}
          title="No notifications found"
          subtitle="Try changing the type or read filter above."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Today */}
          {todayItems.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 10, paddingLeft: 2 }}>
                🔔 Today · {todayItems.length} Notification{todayItems.length !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayItems.map(n => <NotifCard key={n.id} notif={n} />)}
              </div>
            </div>
          )}

          {/* Earlier */}
          {earlierItems.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 10, paddingLeft: 2 }}>
                📅 Earlier · {earlierItems.length} Notification{earlierItems.length !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {earlierItems.map(n => <NotifCard key={n.id} notif={n} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

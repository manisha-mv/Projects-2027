// pages/Notifications/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiNotification3Line, RiCheckDoubleLine } from 'react-icons/ri';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/common/PageHeader';

export default function NotificationsPage() {
  const { role } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      fetchNotifications();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead(role);
      addToast({ type: 'success', title: 'Marked All Read', message: 'All notifications marked as read.' });
      fetchNotifications();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    }
  };

  return (
    <div className="module-page">
      <PageHeader
        title="Notifications Center"
        subtitle="Role-based alert notifications, clinical updates, and system messages"
        icon={<RiNotification3Line />}
        actions={
          <button className="btn btn-outline" onClick={handleMarkAllRead}>
            <RiCheckDoubleLine /> Mark All Read
          </button>
        }
      />

      {loading ? (
        <div className="loading-center"><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState icon={<RiNotification3Line />} title="No notifications" subtitle="You have no notifications at this time." />
      ) : (
        <div className="table-card">
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>
              Notifications for Role: {role || 'ALL'}
            </h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Notification Title</th>
                <th>Message</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif) => (
                <tr key={notif.id} style={{ backgroundColor: notif.read ? 'transparent' : 'var(--color-primary-light)' }}>
                  <td><Badge variant="primary">{notif.type}</Badge></td>
                  <td><strong>{notif.title}</strong></td>
                  <td>{notif.message}</td>
                  <td className="cell-sub">{new Date(notif.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <Badge variant={notif.read ? 'secondary' : 'warning'}>
                      {notif.read ? 'Read' : 'Unread'}
                    </Badge>
                  </td>
                  <td>
                    {!notif.read && (
                      <button className="btn btn-sm btn-ghost" onClick={() => handleMarkRead(notif.id)}>
                        Mark Read
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

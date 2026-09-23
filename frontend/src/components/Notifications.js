import React, { useEffect, useState } from 'react';

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // ======================================================
  // FETCH NOTIFICATIONS
  // ======================================================

  const fetchNotifications = async (
    showLoading = false
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError('');

      const response = await getNotifications();

      setNotifications(
        response.data?.notifications || []
      );
    } catch (err) {
      console.error(
        'Error fetching notifications:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to load notifications'
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // ======================================================
  // FETCH UNREAD COUNT
  // ======================================================

  const fetchUnreadCount = async () => {
    try {
      const response =
        await getUnreadNotificationCount();

      setUnreadCount(
        response.data?.count || 0
      );
    } catch (err) {
      console.error(
        'Error fetching unread count:',
        err
      );
    }
  };

  // ======================================================
  // INITIAL LOAD + AUTO REFRESH
  // ======================================================

  useEffect(() => {
    // Initial load
    fetchNotifications(true);
    fetchUnreadCount();

    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(false);
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ======================================================
  // MARK ONE AS READ
  // ======================================================

  const handleMarkAsRead = async (
    notificationId
  ) => {
    try {
      await markNotificationAsRead(
        notificationId
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true
              }
            : notification
        )
      );

      setUnreadCount((previous) =>
        previous > 0
          ? previous - 1
          : 0
      );
    } catch (err) {
      console.error(
        'Error marking notification as read:',
        err
      );
    }
  };

  // ======================================================
  // MARK ALL AS READ
  // ======================================================

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);

      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        'Error marking all notifications as read:',
        err
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // DELETE NOTIFICATION
  // ======================================================

  const handleDelete = async (
    notificationId
  ) => {
    try {
      const notification =
        notifications.find(
          (item) =>
            item._id === notificationId
        );

      await deleteNotification(
        notificationId
      );

      setNotifications((previous) =>
        previous.filter(
          (item) =>
            item._id !== notificationId
        )
      );

      if (
        notification &&
        !notification.isRead
      ) {
        setUnreadCount((previous) =>
          previous > 0
            ? previous - 1
            : 0
        );
      }
    } catch (err) {
      console.error(
        'Error deleting notification:',
        err
      );
    }
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return '';
    }

    return new Date(date).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    );
  };

  // ======================================================
  // NOTIFICATION ICON
  // ======================================================

  const getNotificationIcon = (
    type
  ) => {
    switch (type) {
      case 'worker_assigned':
        return '👷';

      case 'booking_started':
        return '🔧';

      case 'booking_completed':
        return '✅';

      case 'booking_cancelled':
        return '❌';

      case 'booking_rescheduled':
        return '📅';

      case 'payment_completed':
        return '💰';

      case 'booking_confirmed':
        return '✅';

      case 'booking_created':
        return '📋';

      case 'feedback_received':
        return '⭐';

      case 'worker_verified':
        return '✔️';

      default:
        return '🔔';
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            🔔 Notifications
          </h2>
        </div>

        <div style={styles.centerMessage}>
          Loading notifications...
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            🔔 Notifications
          </h2>

          <p style={styles.subtitle}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount > 1
                    ? 's'
                    : ''
                }`
              : 'No unread notifications'}
          </p>
        </div>

        <div style={styles.headerActions}>

          <button
            type="button"
            onClick={() => {
              fetchNotifications(true);
              fetchUnreadCount();
            }}
            style={styles.refreshButton}
          >
            🔄 Refresh
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={
                handleMarkAllAsRead
              }
              disabled={actionLoading}
              style={{
                ...styles.readAllButton,
                ...(actionLoading
                  ? styles.disabledButton
                  : {})
              }}
            >
              {actionLoading
                ? 'Processing...'
                : '✓ Mark all as read'}
            </button>
          )}

        </div>
      </div>

      {/* AUTO REFRESH INFO */}

      <div style={styles.autoRefreshInfo}>
        🔄 Notifications automatically refresh
        every 30 seconds.
      </div>

      {/* ERROR */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* EMPTY STATE */}

      {!error &&
        notifications.length === 0 && (
          <div style={styles.empty}>

            <div style={styles.emptyIcon}>
              🔔
            </div>

            <h3 style={styles.emptyTitle}>
              No notifications
            </h3>

            <p style={styles.emptyText}>
              You're all caught up!
            </p>

          </div>
        )}

      {/* NOTIFICATION LIST */}

      {notifications.length > 0 && (
        <div style={styles.list}>

          {notifications.map(
            (notification) => (
              <div
                key={notification._id}
                style={{
                  ...styles.notification,

                  ...(notification.isRead
                    ? styles.readNotification
                    : styles.unreadNotification)
                }}
              >

                {/* ICON */}

                <div style={styles.icon}>
                  {getNotificationIcon(
                    notification.type
                  )}
                </div>

                {/* CONTENT */}

                <div
                  style={
                    styles.content
                  }
                >

                  <div
                    style={
                      styles.notificationHeader
                    }
                  >

                    <h3
                      style={
                        styles.notificationTitle
                      }
                    >
                      {notification.title ||
                        'Notification'}
                    </h3>

                    {!notification.isRead && (
                      <span
                        style={
                          styles.unreadBadge
                        }
                      >
                        NEW
                      </span>
                    )}

                  </div>

                  <p
                    style={
                      styles.message
                    }
                  >
                    {notification.message}
                  </p>

                  <p
                    style={
                      styles.date
                    }
                  >
                    {formatDate(
                      notification.createdAt
                    )}
                  </p>

                  {/* ACTIONS */}

                  <div
                    style={
                      styles.actions
                    }
                  >

                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsRead(
                            notification._id
                          )
                        }
                        style={
                          styles.readButton
                        }
                      >
                        ✓ Mark as read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          notification._id
                        )
                      }
                      style={
                        styles.deleteButton
                      }
                    >
                      🗑 Delete
                    </button>

                  </div>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
};

// ======================================================
// STYLES
// ======================================================

const styles = {

  container: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px 20px',
    boxSizing: 'border-box'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },

  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#12372A'
  },

  subtitle: {
    margin: '6px 0 0',
    color: '#6b7280',
    fontSize: '14px'
  },

  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },

  refreshButton: {
    border: '1px solid #198754',
    background: '#ffffff',
    color: '#198754',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },

  readAllButton: {
    border: 'none',
    background: '#198754',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },

  disabledButton: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },

  autoRefreshInfo: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px'
  },

  error: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '20px'
  },

  centerMessage: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280'
  },

  empty: {
    textAlign: 'center',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '60px 20px'
  },

  emptyIcon: {
    fontSize: '50px',
    marginBottom: '10px'
  },

  emptyTitle: {
    margin: '0 0 8px',
    color: '#1f2937'
  },

  emptyText: {
    margin: 0,
    color: '#6b7280'
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  notification: {
    display: 'flex',
    gap: '15px',
    padding: '18px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    transition: '0.2s ease'
  },

  unreadNotification: {
    background: '#f0fdf4',
    borderLeft: '4px solid #198754'
  },

  readNotification: {
    background: '#ffffff'
  },

  icon: {
    width: '46px',
    height: '46px',
    minWidth: '46px',
    borderRadius: '50%',
    background: '#e8f5e9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px'
  },

  content: {
    flex: 1,
    minWidth: 0
  },

  notificationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },

  notificationTitle: {
    margin: 0,
    fontSize: '17px',
    color: '#1f2937'
  },

  unreadBadge: {
    fontSize: '10px',
    fontWeight: '700',
    background: '#198754',
    color: '#ffffff',
    padding: '4px 7px',
    borderRadius: '10px'
  },

  message: {
    margin: '8px 0',
    color: '#4b5563',
    lineHeight: '1.5'
  },

  date: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af'
  },

  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
    flexWrap: 'wrap'
  },

  readButton: {
    border: '1px solid #198754',
    background: '#ffffff',
    color: '#198754',
    padding: '7px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },

  deleteButton: {
    border: '1px solid #dc3545',
    background: '#ffffff',
    color: '#dc3545',
    padding: '7px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  }
};

export default Notifications;
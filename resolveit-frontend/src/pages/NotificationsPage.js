import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/NotificationsPage.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'unread' ? '/api/notifications/unread' : '/api/notifications';
      const res = await api.get(endpoint);
      
      if (res.data.status === 'success') {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Delete this notification?')) return;
    
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.complaintId) {
      navigate(`/complaint/${notification.complaintId}`);
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-wrapper">
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-header-content">
            <div>
              <h1 className="notifications-title">
                🔔 Notifications
              </h1>
              <p className="notifications-subtitle">
                Stay updated with your complaint activities
              </p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="mark-all-read-btn"
              >
                Mark All Read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="notifications-tabs">
            <button
              onClick={() => setFilter('all')}
              className={`notifications-tab ${filter === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`notifications-tab ${filter === 'unread' ? 'active' : ''}`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="loading-state">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">No Notifications</h3>
            <p className="empty-message">
              {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-content">
                  <div className="notification-main">
                    <div className="notification-header">
                      <h3 className="notification-title">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="new-badge">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <div className="notification-date">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="delete-btn"
                    title="Delete notification"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="back-section">
          <Link to="/dashboard" className="modern-link">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
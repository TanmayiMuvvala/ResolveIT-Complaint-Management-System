import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Add CSS for animation
const dropdownStyles = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = dropdownStyles;
  document.head.appendChild(styleSheet);
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          bellRef.current && !bellRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      if (res.data.status === 'success') {
        setUnreadCount(res.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications/unread');
      if (res.data.status === 'success') {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!showDropdown) {
      fetchNotifications();
      // Calculate dropdown position relative to viewport
      if (bellRef.current) {
        const rect = bellRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.right - 320 // 320px is dropdown width, align right edge
        });
      }
    }
    setShowDropdown(!showDropdown);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const renderDropdown = () => {
    if (!showDropdown) return null;

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999998,
            background: 'transparent'
          }}
          onClick={() => setShowDropdown(false)}
        />
        
        {/* Dropdown */}
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: '320px',
            maxHeight: '450px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
            zIndex: 999999,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.1)',
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          {/* Small arrow pointing to the bell */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '20px',
            width: '16px',
            height: '16px',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.1)',
            borderBottom: 'none',
            borderRight: 'none',
            transform: 'rotate(45deg)',
            zIndex: 1000000
          }}></div>
          
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Notifications
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: '320px',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {loading ? (
              <div style={{ 
                padding: '30px 20px', 
                textAlign: 'center', 
                color: '#666',
                fontSize: '14px'
              }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#999' 
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
                <p style={{ margin: 0, fontSize: '14px' }}>No new notifications</p>
              </div>
            ) : (
              notifications.slice(0, 5).map(notification => ( // Limit to 5 notifications
                <div
                  key={notification.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: notifications.indexOf(notification) < Math.min(notifications.length - 1, 4) ? '1px solid #f5f5f5' : 'none',
                    cursor: 'pointer',
                    background: notification.read ? 'white' : '#f8f9ff',
                    transition: 'background 0.2s ease'
                  }}
                  onClick={() => markAsRead(notification.id)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = notification.read ? '#f9f9f9' : '#f0f4ff'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = notification.read ? 'white' : '#f8f9ff'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px'
                  }}>
                    <strong style={{ 
                      fontSize: '13px', 
                      color: '#333',
                      lineHeight: '1.3',
                      flex: 1,
                      marginRight: '8px'
                    }}>
                      {notification.title}
                    </strong>
                    {!notification.read && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        background: '#1976d2',
                        borderRadius: '50%',
                        marginTop: '4px',
                        flexShrink: 0
                      }}></span>
                    )}
                  </div>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '12px',
                    color: '#666',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {notification.message}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '11px',
                      color: '#999'
                    }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                    {notification.complaintId && (
                      <Link
                        to={`/complaint/${notification.complaintId}`}
                        style={{
                          fontSize: '11px',
                          color: '#1976d2',
                          textDecoration: 'none',
                          fontWeight: '500',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: 'rgba(25, 118, 210, 0.1)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(false);
                        }}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #f0f0f0',
            textAlign: 'center',
            background: '#fafafa'
          }}>
            <Link
              to="/notifications"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                display: 'inline-block'
              }}
              onClick={() => setShowDropdown(false)}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              View All Notifications
            </Link>
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Icon */}
      <button
        ref={bellRef}
        onClick={handleBellClick}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          padding: '8px',
          color: '#333',
          borderRadius: '50%',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#f44336',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Render dropdown using portal */}
      {renderDropdown()}
    </div>
  );
}
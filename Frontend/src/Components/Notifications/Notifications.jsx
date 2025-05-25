import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import Navbar from '../Navbar/Navbar';
import './Notifications.css';

const BACKGROUND_IMAGE = '/backgroundimg.png';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [markingAsRead, setMarkingAsRead] = useState(new Set());
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const { currentUser, getIdToken } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      requestNotificationPermission();
      
      // More frequent refresh for real-time notifications
      const interval = setInterval(fetchNotifications, 5000); // Every 5 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.notification_id}`,
        requireInteraction: true
      });

      browserNotification.onclick = () => {
        window.focus();
        handleNotificationClick(notification);
        browserNotification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (loading) {
        setLoading(true);
      }
      setError(null);
      
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('https://brocab.onrender.com/user/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Notifications API Response:', data);
      
      let newNotifications = [];
      if (data && data.notifications && Array.isArray(data.notifications)) {
        newNotifications = data.notifications;
      } else if (Array.isArray(data)) {
        newNotifications = data;
      }

      // Check for new notifications and show browser notifications
      if (lastNotificationCount > 0 && newNotifications.length > lastNotificationCount) {
        const latestNotifications = newNotifications.slice(0, newNotifications.length - lastNotificationCount);
        latestNotifications.forEach(notification => {
          if (!notification.read) {
            showBrowserNotification(notification);
          }
        });
      }

      setNotifications(newNotifications);
      setLastNotificationCount(newNotifications.length);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.message.includes('Authentication failed')) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load notifications');
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    if (markingAsRead.has(notificationId)) return;

    try {
      setMarkingAsRead(prev => new Set(prev).add(notificationId));
      
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`https://brocab.onrender.com/notification/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.notification_id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );

      // Dispatch custom event to update navbar count
      window.dispatchEvent(new CustomEvent('notificationRead'));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Failed to mark notification as read');
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) {
      alert('No unread notifications to mark');
      return;
    }

    if (!window.confirm(`Mark all ${unreadNotifications.length} unread notifications as read?`)) {
      return;
    }

    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Mark all unread notifications as read
      const promises = unreadNotifications.map(notification =>
        fetch(`https://brocab.onrender.com/notification/${notification.notification_id}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      );

      await Promise.all(promises);

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );

      // Dispatch custom event to update navbar count
      window.dispatchEvent(new CustomEvent('notificationRead'));
      
      alert('All notifications marked as read!');
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Failed to mark all notifications as read');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return 'N/A';
    }
  };

  const getNotificationIcon = (title) => {
    const lowerTitle = title?.toLowerCase() || '';
    
    if (lowerTitle.includes('join request') || lowerTitle.includes('wants to join')) return '🙋‍♂️';
    if (lowerTitle.includes('accepted') || lowerTitle.includes('approved')) return '✅';
    if (lowerTitle.includes('rejected') || lowerTitle.includes('declined')) return '❌';
    if (lowerTitle.includes('new ride') || lowerTitle.includes('available')) return '🚗';
    if (lowerTitle.includes('cancelled')) return '🚫';
    if (lowerTitle.includes('reminder')) return '⏰';
    if (lowerTitle.includes('payment')) return '💳';
    return '📢';
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.notification_id);
    }

    // Navigate based on notification type
    const title = notification.title?.toLowerCase() || '';
    if (title.includes('join request') || title.includes('wants to join')) {
      // Navigate to My Rides to manage requests
      window.location.href = '/my-rides';
    } else if (title.includes('accepted') || title.includes('approved')) {
      // Navigate to My Booked Rides
      window.location.href = '/my-booked-rides';
    } else if (title.includes('rejected')) {
      // Navigate to Requested rides
      window.location.href = '/requested';
    }
  };

  // Safe filtering with null check
  const filteredNotifications = (notifications || []).filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  // Safe count calculation
  const unreadCount = (notifications || []).filter(n => !n.read).length;
  const totalCount = (notifications || []).length;

  if (!currentUser) {
    return (
      <div className="bcNotifications-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <Navbar />
        <div className="bcNotifications-main-content">
          <div className="bcNotifications-error">
            <h2>Authentication Required</h2>
            <p>Please login to view your notifications.</p>
            <button onClick={() => window.location.href = '/login'} className="bcNotifications-back-btn">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="bcNotifications-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <Navbar />
        <div className="bcNotifications-main-content">
          <div className="bcNotifications-loading">
            <div className="bcNotifications-spinner"></div>
            <p>Loading your notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bcNotifications-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <Navbar />
        <div className="bcNotifications-main-content">
          <div className="bcNotifications-error">
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={fetchNotifications} className="bcNotifications-back-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bcNotifications-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
      <Navbar />
      
      <div className="bcNotifications-main-content">
        <div className="bcNotifications-header">
          <h1 className="bcNotifications-title">Notifications</h1>
          <p className="bcNotifications-subtitle">
            Stay updated with your ride activities
          </p>
        </div>

        <div className="bcNotifications-controls">
          <div className="bcNotifications-filters">
            <button 
              className={`bcNotifications-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({totalCount})
            </button>
            <button 
              className={`bcNotifications-filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button 
              className={`bcNotifications-filter-btn ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read ({totalCount - unreadCount})
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button 
              className="bcNotifications-mark-all-btn"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </button>
          )}
        </div>

        <div className="bcNotifications-content-wrapper">
          {filteredNotifications.length === 0 ? (
            <div className="bcNotifications-empty">
              <div className="bcNotifications-empty-icon">
                {filter === 'unread' ? '📭' : filter === 'read' ? '📬' : '📪'}
              </div>
              <h3>
                {filter === 'unread' 
                  ? 'No unread notifications' 
                  : filter === 'read' 
                    ? 'No read notifications'
                    : 'No notifications yet'
                }
              </h3>
              <p>
                {filter === 'unread' 
                  ? 'All caught up! You have no unread notifications.' 
                  : filter === 'read'
                    ? 'No notifications have been read yet.'
                    : 'You\'ll see your ride updates and alerts here.'
                }
              </p>
            </div>
          ) : (
            <div className="bcNotifications-list">
              {filteredNotifications.map((notification, index) => (
                <div 
                  key={`notification-${notification.notification_id}-${index}`} 
                  className={`bcNotifications-card ${!notification.read ? 'unread' : 'read'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="bcNotifications-card-content">
                    <div className="bcNotifications-icon">
                      {getNotificationIcon(notification.title)}
                    </div>
                    
                    <div className="bcNotifications-content">
                      <div className="bcNotifications-header-row">
                        <h3 className="bcNotifications-notification-title">
                          {notification.title}
                        </h3>
                        <div className="bcNotifications-meta">
                          <span className="bcNotifications-time">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="bcNotifications-unread-dot"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="bcNotifications-message">
                        {notification.message}
                      </p>
                    </div>
                    
                    {!notification.read && (
                      <button 
                        className="bcNotifications-mark-read-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.notification_id);
                        }}
                        disabled={markingAsRead.has(notification.notification_id)}
                      >
                        {markingAsRead.has(notification.notification_id) ? '...' : '✓'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

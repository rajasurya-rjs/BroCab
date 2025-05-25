import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import Navbar from '../Navbar/Navbar';
import './Notifications.css';

const BACKGROUND_IMAGE = '/backgroundimg.png';

const Notifications = () => {
  // Initialize as empty array instead of null
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [markingAsRead, setMarkingAsRead] = useState(new Set());
  const { currentUser, getIdToken } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
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
      
      // Ensure we always set an array, never null
      if (data && data.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        // If API returns null or unexpected format, set empty array
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.message.includes('Authentication failed')) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load notifications');
      }
      // Always set empty array on error, never null
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component code remains the same...
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

  // Safe filtering with null check
  const filteredNotifications = (notifications || []).filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  // Safe count calculation
  const unreadCount = (notifications || []).filter(n => !n.read).length;
  const totalCount = (notifications || []).length;

  // Rest of your component JSX...
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
                  onClick={() => !notification.read && markAsRead(notification.notification_id)}
                >
                  {/* Your notification card content */}
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

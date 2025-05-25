import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import { userAPI, notificationAPI } from '../../utils/api';
import './Notifications.css';

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return 'Today';
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Render notification icon based on type
const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'ride_request_approved':
      return <span className="notification-icon">✅</span>;
    case 'ride_request_rejected':
      return <span className="notification-icon">❌</span>;
    case 'new_ride_request':
      return <span className="notification-icon">🚗</span>;
    case 'ride_cancelled':
      return <span className="notification-icon">🚫</span>;
    case 'participant_left':
      return <span className="notification-icon">👤</span>;
    default:
      return <span className="notification-icon">📣</span>;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Add a small delay to ensure authentication is fully initialized
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 100);

    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Fetching notifications...');
      const data = await userAPI.getNotifications();
      console.log('Raw API response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      // Check if data is null, undefined, or not an array
      if (!data) {
        console.error('API returned null/undefined data');
        setError('No notification data received from server.');
        setLoading(false);
        return;
      }
      
      if (!Array.isArray(data)) {
        console.error('API did not return an array:', data);
        setError('Invalid data format received from server.');
        setLoading(false);
        return;
      }
      
      // Map backend response to frontend expected format
      const mappedNotifications = data.map(notification => {
        console.log('Processing notification:', notification);
        return {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: notification.is_read,
          timestamp: notification.created_at,
          rideId: notification.ride_id,
          rideInfo: {
            origin: notification.origin,
            destination: notification.destination,
            date: notification.date,
            time: notification.time
          }
        };
      });
      
      console.log('Mapped notifications:', mappedNotifications);
      
      // Sort notifications by time (newest first)
      const sortedNotifications = mappedNotifications.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      console.log('Sorted notifications:', sortedNotifications);
      setNotifications(sortedNotifications);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError('Failed to load notifications. Please try again later.');
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // If notification is unread, mark it as read
    if (!notification.read) {
      try {
        await notificationAPI.markAsRead(notification.id);
        
        // Update local state to reflect read status
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        
        // Trigger a custom event to update navbar notification count
        window.dispatchEvent(new CustomEvent('notificationRead'));
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'ride_request_approved':
      case 'ride_cancelled':
      case 'participant_left':
        navigate(`/dashboard`);
        break;
      case 'new_ride_request':
        if (notification.rideId) {
          navigate(`/dashboard?ride=${notification.rideId}&tab=requests`);
        }
        break;
      default:
        // Stay on notifications page by default
        break;
    }
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = formatDate(notification.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  if (loading) {
    return <div className="notifications-container loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notifications-container error">{error}</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="notifications-container">
        <h1>Notifications</h1>
        <div className="no-notifications">
          <h3>No notifications yet</h3>
          <p>When you have new notifications, they will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <h1>Notifications</h1>
      
      {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
        <div key={date} className="notification-date-group">
          <div className="notification-date">{date}</div>
          
          {dateNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <NotificationIcon type={notification.type} />
              
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <span className="notification-time">{formatTime(notification.timestamp)}</span>
                </div>
                
                <p className="notification-message">{notification.message}</p>
                
                {notification.rideInfo && (
                  <div className="notification-ride-info">
                    <span>
                      <strong>From:</strong> {notification.rideInfo.origin}
                    </span>
                    <span>
                      <strong>To:</strong> {notification.rideInfo.destination}
                    </span>
                    <span>
                      <strong>Date:</strong> {new Date(notification.rideInfo.date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              {!notification.read && (
                <div className="notification-unread-indicator"></div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
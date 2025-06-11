import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import Navbar from '../Navbar/Navbar';
import './Notifications.css';

const BACKGROUND_IMAGE = '/backgroundimg.png';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      if (!token) throw new Error('No authentication token available');

      const response = await fetch('https://brocab.onrender.com/user/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication failed. Please login again.');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message.includes('Authentication failed')) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load notifications');
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read when loaded
  useEffect(() => {
    const markAllAsRead = async () => {
      if (!currentUser || notifications.length === 0) return;
      const token = await getIdToken();
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n =>
        fetch(`https://brocab.onrender.com/notification/${n.id}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };
    markAllAsRead();
    // eslint-disable-next-line
  }, [notifications, currentUser]);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const getIcon = (type, title) => {
    if (type === 'participant_removed') return '🚫';
    if (type === 'ride_cancelled') return '🚗❌';
    if (title?.toLowerCase().includes('join request')) return '🙋‍♂️';
    if (title?.toLowerCase().includes('accepted')) return '✅';
    if (title?.toLowerCase().includes('rejected')) return '❌';
    return '📢';
  };

  if (!currentUser) {
    return (
      <div className="bcMyRides-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <Navbar />
        <div className="bcMyRides-main-content">
          <div className="bcMyRides-error">
            <h2>Authentication Required</h2>
            <p>Please login to view your notifications.</p>
            <button onClick={() => window.location.href = '/login'} className="bcMyRides-back-btn">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bcMyRides-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <Navbar />
        <div className="bcMyRides-main-content">
          <div className="bcMyRides-loading">
            <div className="bcMyRides-spinner"></div>
            <p>Loading your notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bcMyRides-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <Navbar />
        <div className="bcMyRides-main-content">
          <div className="bcMyRides-error">
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={fetchNotifications} className="bcMyRides-back-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bcMyRides-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
      <Navbar />
      <div className="bcMyRides-main-content">
        {/* Header Section */}
        <div className="bcMyRides-search-section">
          <h1 className="bcMyRides-header-title">Notifications</h1>
          <p className="bcMyRides-header-subtitle">
            Stay updated with your ride activities
          </p>
        </div>

        {/* Results Info */}
        <div className="bcMyRides-results-info">
          <span className="bcMyRides-results-count">
            {notifications.length} notifications
          </span>
        </div>

        <div className="bcMyRides-content-wrapper">
          {notifications.length === 0 ? (
            <div className="bcMyRides-no-rides">
              <div className="bcMyRides-no-rides-icon">📪</div>
              <h3>No notifications yet</h3>
              <p>You'll see your ride updates and alerts here.</p>
            </div>
          ) : (
            <div className="bcMyRides-list">
              {notifications.map((n, idx) => (
                <div key={n.id || idx} className="bcMyRides-card">
                  <div className="bcMyRides-card-content" style={{ gridTemplateColumns: '60px 2fr 1fr' }}>
                    {/* Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span
                        style={{
                          fontSize: 36,
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: 'white',
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(139,92,246,0.09)'
                        }}
                      >
                        {getIcon(n.type, n.title)}
                      </span>
                    </div>
                    {/* Main Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 17, color: '#1e293b' }}>{n.title}</span>
                      <span style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>{n.message}</span>
                      <span style={{ fontSize: 13, color: '#8b5cf6', fontWeight: 500, marginTop: 4 }}>
                        {n.origin && n.destination &&
                          <>From <b>{n.origin}</b> to <b>{n.destination}</b> &middot; {n.date} {n.time}</>
                        }
                      </span>
                    </div>
                    {/* Time */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                        {formatTime(n.created_at)}
                      </span>
                      {!n.is_read && (
                        <span style={{
                          fontSize: 12,
                          color: '#10b981',
                          background: '#e0f7ef',
                          borderRadius: 8,
                          padding: '2px 10px',
                          fontWeight: 700
                        }}>NEW</span>
                      )}
                    </div>
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

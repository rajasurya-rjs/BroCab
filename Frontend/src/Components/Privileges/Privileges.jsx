import React, { useState, useEffect } from 'react';
import { userAPI, rideAPI } from '../../utils/api';
import './Privileges.css';
import Navbar from '../Navbar/Navbar';

const BACKGROUND_IMAGE = '/backgroundimg.png';

const Privileges = () => {
  const [privileges, setPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningRide, setJoiningRide] = useState(null);

  useEffect(() => {
    fetchPrivileges();
  }, []);

  const fetchPrivileges = async () => {
    try {
      setLoading(true);
      console.log('Fetching privileges...');
      const data = await userAPI.getPrivileges();
      console.log('Privileges data received:', data);
      setPrivileges(data || []);  // Ensure we always set an array even if data is null
      setError('');
    } catch (err) {
      console.error('Error fetching privileges:', err);
      setError('Failed to fetch privileges: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRide = async (rideId) => {
    try {
      setJoiningRide(rideId);
      await rideAPI.joinWithPrivilege(rideId);
      // Refresh privileges to update the list
      await fetchPrivileges();
      alert('Successfully joined the ride!');
    } catch (err) {
      alert('Failed to join ride: ' + err.message);
    } finally {
      setJoiningRide(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="privileges-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="privileges-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
      <Navbar />
      
      <div className="privileges-content">
        <div className="privileges-header">
          <h2>My Ride Privileges</h2>
          <p className="privileges-subtitle">
            These are rides you've been approved to join. You can use these privileges to join rides directly.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <i className="error-icon">⚠️</i>
            {error}
          </div>
        )}

        {privileges.length === 0 ? (
          <div className="no-privileges">
            <div className="no-privileges-icon">🎫</div>
            <h3>No Privileges Available</h3>
            <p>You don't have any ride privileges yet. Request to join rides to get approved!</p>
          </div>
        ) : (
          <div className="privileges-grid">
            {privileges.map((privilege) => (
              <div key={privilege.request_id} className="privilege-card">
                <div className="privilege-header">
                  <div className="route-info">
                    <h3 className="route">
                      {privilege.origin} → {privilege.destination}
                    </h3>
                    <div className="privilege-badge">
                      <span>Approved Privilege</span>
                    </div>
                  </div>
                </div>

                <div className="privilege-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <i className="icon">📅</i>
                      <span className="label">Date:</span>
                      <span className="value">{formatDate(privilege.date)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="icon">⏰</i>
                      <span className="label">Time:</span>
                      <span className="value">{formatTime(privilege.time)}</span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <i className="icon">💰</i>
                      <span className="label">Price:</span>
                      <span className="value">₹{privilege.price}</span>
                    </div>
                    <div className="detail-item">
                      <i className="icon">👥</i>
                      <span className="label">Seats:</span>
                      <span className="value">
                        {privilege.seats_available} available of {privilege.total_seats}
                      </span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <i className="icon">✅</i>
                      <span className="label">Approved on:</span>
                      <span className="value">
                        {new Date(privilege.approved_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="privilege-actions">
                  {privilege.can_join ? (
                    <button
                      className="join-btn"
                      onClick={() => handleJoinRide(privilege.ride_id)}
                      disabled={joiningRide === privilege.ride_id}
                    >
                      {joiningRide === privilege.ride_id ? (
                        <>
                          <span className="btn-spinner"></span>
                          Joining...
                        </>
                      ) : (
                        <>
                          <i className="btn-icon">🚗</i>
                          Use Privilege to Join
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="unavailable-notice">
                      <i className="notice-icon">⚠️</i>
                      <span>Ride is full - No seats available</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="privileges-footer">
          <button className="refresh-btn" onClick={fetchPrivileges} disabled={loading}>
            <i className="refresh-icon">🔄</i>
            Refresh Privileges
          </button>
        </div>
      </div>
    </div>
  );
};

export default Privileges;
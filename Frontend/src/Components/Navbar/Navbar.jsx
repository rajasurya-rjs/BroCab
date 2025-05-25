import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../firebase/AuthContext';
import { userAPI } from '../../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUserDetails, logout, currentUser } = useAuth();
  const [userName, setUserName] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUserName = async () => {
      if (currentUser) {
        const userData = await fetchUserDetails();
        setUserName(userData?.name || 'User');
      }
    };
    fetchUserName();
    
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 30000);
    
    const handleNotificationRead = () => {
      fetchUnreadCount();
    };
    
    window.addEventListener('notificationRead', handleNotificationRead);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('notificationRead', handleNotificationRead);
    };
  }, [currentUser, fetchUserDetails]);
  
  const fetchUnreadCount = async () => {
    try {
      const data = await userAPI.getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  };

  const handleUpdateProfile = () => {
    navigate('/update-profile');
    setShowDropdown(false);
  };

  const handleMyRides = () => {
    navigate('/my-rides');
    setShowDropdown(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setShowDropdown(false);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setShowDropdown(false);
      navigate('/login');
    }
  };

  const handleBrandClick = () => {
    if (location.pathname === '/dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/dashboard');
    }
  };

  // Add delay to prevent flickering
  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    // Add a small delay before closing to prevent flickering
    setTimeout(() => {
      setShowDropdown(false);
    }, 100);
  };

  return (
    <nav className="bcDash-navbar">
      <div 
        className="bcDash-nav-brand" 
        onClick={handleBrandClick}
      >
        BroCab
      </div>
      
      <div className="bcDash-nav-links">
        <button 
          onClick={() => navigate('/my-booked-rides')} 
          className="bcDash-nav-link bcDash-nav-button"
        >
          My Bookings
        </button>
        <button 
          onClick={() => navigate('/privileges')}
          className="bcDash-nav-link bcDash-nav-button"
        >
          My Privilege
        </button>
        <button 
          onClick={() => navigate('/notifications')}
          className="bcDash-nav-link bcDash-nav-button notification-btn"
        >
          Notifications
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
        <button 
          onClick={() => navigate('/requested')} 
          className="bcDash-nav-link bcDash-nav-button"
        >
          Requested
        </button>
      </div>
      <div className="bcDash-nav-auth">
        {currentUser ? (
          <>
            <button 
              onClick={() => navigate('/contact-us')} 
              className="bcDash-contact-btn"
            >
              Contact Us
            </button>
            <div 
              className="bcDash-user-dropdown-wrapper"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="bcDash-profile-icon">
                <span className="bcDash-profile-initial">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              {showDropdown && (
                <div 
                  className="bcDash-user-dropdown"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button onClick={handleMyRides} className="bcDash-dropdown-item">
                    My Rides
                  </button>
                  <button onClick={handleUpdateProfile} className="bcDash-dropdown-item">
                    Update Profile
                  </button>
                  <button onClick={handleSignOut} className="bcDash-dropdown-item">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button className="bcDash-login-btn" onClick={() => navigate('/login')}>Login</button>
            <button className="bcDash-signup-btn" onClick={() => navigate('/signup')}>Signup</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

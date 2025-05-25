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
    
    // Fetch unread notification count
    fetchUnreadCount();
    
    // Set up interval to periodically check for new notifications
    const intervalId = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    
    // Listen for notification read events
    const handleNotificationRead = () => {
      fetchUnreadCount();
    };
    
    window.addEventListener('notificationRead', handleNotificationRead);
    
    return () => {
      clearInterval(intervalId); // Clean up on unmount
      window.removeEventListener('notificationRead', handleNotificationRead);
    };
  }, []);
  
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

  const handleSignOut = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  // Handle BroCab click - go to dashboard and scroll to top
  const handleBrandClick = () => {
    if (location.pathname === '/dashboard') {
      // If already on dashboard, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <nav className="bcDash-navbar">
      {/* Make BroCab clickable */}
      <div 
        className="bcDash-nav-brand" 
        onClick={handleBrandClick}
      >
        BroCab
      </div>
      
      <div className="bcDash-nav-links">
        <a href="#" className="bcDash-nav-link">My Rides</a>
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
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div className="bcDash-profile-icon">
                <span className="bcDash-profile-initial">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              {showDropdown && (
                <div className="bcDash-user-dropdown">
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

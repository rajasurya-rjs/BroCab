import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../firebase/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { fetchUserDetails, signOut } = useAuth(); // Assume signOut is in your AuthContext
  const [userName, setUserName] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      const userData = await fetchUserDetails();
      setUserName(userData.name);
    };
    fetchUserName();
  }, []);

  const handleUpdateProfile = () => {
    navigate('/update-profile');
    setShowDropdown(false);
  };

  const handleSignOut = () => {
    signOut();
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <nav className="bcDash-navbar">
      <div className="bcDash-nav-brand">BroCab</div>
      <div className="bcDash-nav-links">
        <a href="#" className="bcDash-nav-link">My Rides</a>
        <a href="#" className="bcDash-nav-link">My Privilege</a>
        <a href="#" className="bcDash-nav-link">Notifications</a>
        <button 
          onClick={() => navigate('/contact-us')} 
          className="bcDash-nav-link bcDash-nav-button"
        >
          Contact Us
        </button>
      </div>
      <div className="bcDash-nav-auth">
        {userName ? (
          <div 
            className="bcDash-user-dropdown-wrapper"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <span className="bcDash-user-name">{userName}</span>
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

import React from 'react';
import './Navbar.css'; // Import Navbar-specific styles
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  
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
        <button className="bcDash-login-btn" onClick={() => navigate('/login')}>Login</button>
        <button className="bcDash-signup-btn" onClick={() => navigate('/signup')}>Signup</button>
      </div>
    </nav>
  );
};

export default Navbar;

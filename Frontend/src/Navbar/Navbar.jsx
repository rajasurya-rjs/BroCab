import React from 'react';
import './Navbar.css'; // Import Navbar-specific styles
const Navbar = () => (
  <nav className="bcDash-navbar">
    <div className="bcDash-nav-brand">BroCab</div>
    <div className="bcDash-nav-links">
      <a href="#" className="bcDash-nav-link">My Rides</a>
      <a href="#" className="bcDash-nav-link">My Privilege</a>
      <a href="#" className="bcDash-nav-link">Notifications</a>
      <a href="#" className="bcDash-nav-link">Contact Us</a>
    </div>
    <div className="bcDash-nav-auth">
      <button className="bcDash-login-btn">Login</button>
      <button className="bcDash-signup-btn">Signup</button>
    </div>
  </nav>
);

export default Navbar;

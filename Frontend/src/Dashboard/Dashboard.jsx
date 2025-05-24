import React from 'react';
import './Dashboard.css'; // Import Dashboard styles
import Navbar from '../Navbar/Navbar.jsx'; // Import Navbar component (relative path)

// Background image constant
const BACKGROUND_IMAGE = '/backgroundimg.png';

const Dashboard = () => {
  return (
    <div className="bcDash-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <div className="bcDash-main-content">
        <div className="bcDash-hero-section">
          <h1 className="bcDash-hero-title">Post Your Route.</h1>
          <h1 className="bcDash-hero-subtitle">Find your Crew.</h1>

          {/* Search Form */}
          <div className="bcDash-search-form">
            {/* Pickup Location */}
            <div className="bcDash-input-group">
              <div className="bcDash-location-dot bcDash-pickup-dot"></div>
              <input 
                type="text" 
                placeholder="Enter pickup location" 
                className="bcDash-location-input bcDash-pickup-input"
              />
            </div>
            
            {/* Destination */}
            <div className="bcDash-input-group">
              <div className="bcDash-location-dot bcDash-destination-dot"></div>
              <input 
                type="text" 
                placeholder="Enter destination" 
                className="bcDash-location-input bcDash-destination-input"
              />
            </div>

            {/* Date Picker Input Group */}
            <div className="bcDash-input-group">
              <div className="bcDash-date-dot"></div>
              <input 
                type="date" 
                className="bcDash-location-input bcDash-date-input"
                placeholder="Choose date"
              />
            </div>

            <button className="bcDash-search-btn">Search Ride</button>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <section className="bcDash-features-section">
        <div className="bcDash-features-container">
          <div className="bcDash-feature-card">
            <div className="bcDash-feature-icon bcDash-map-icon"></div>
            <h3 className="bcDash-feature-title">Map Your Journey</h3>
            <p className="bcDash-feature-description">
              Create your travel plan by choosing exact pick-up and drop-off spots for a smooth ride.
            </p>
          </div>

          <div className="bcDash-feature-card">
            <div className="bcDash-feature-icon bcDash-browse-icon"></div>
            <h3 className="bcDash-feature-title">Browse Your Choices</h3>
            <p className="bcDash-feature-description">
              Explore all possible routes and select the one that matches your timing and preferences.
            </p>
          </div>

          <div className="bcDash-feature-card">
            <div className="bcDash-feature-icon bcDash-travel-icon"></div>
            <h3 className="bcDash-feature-title">Travel Your Way</h3>
            <p className="bcDash-feature-description">
              Set your own pace, choose your stops, and make each trip exactly how you want it.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bcDash-footer-section">
        <div className="bcDash-footer-content">
          <h2 className="bcDash-footer-title">Why Pay Full Fare? Share the Ride.</h2>
          <p className="bcDash-footer-description">
            Got a cab ride planned? Post your route, find fellow passengers, and cut your 
            costs. Travel smarter, share the fare, and make every journey a little lighter.
          </p>
          <button className="bcDash-offer-seat-btn">Offer a Seat</button>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

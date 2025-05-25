import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import './Dashboard.css'; // Import Dashboard styles
import Navbar from '../Navbar/Navbar'; // Import Navbar component

// Background image constant
const BACKGROUND_IMAGE = '/backgroundimg.png';

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigate hook
  
  // State for form inputs
  const [searchData, setSearchData] = useState({
    pickup: '',
    destination: '',
    date: ''
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search ride button click
  const handleSearchRide = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!searchData.pickup || !searchData.destination || !searchData.date) {
      alert('Please fill in all fields before searching');
      return;
    }

    // Navigate to Available_rides page with search parameters
    const searchParams = new URLSearchParams({
      origin: searchData.pickup,
      destination: searchData.destination,
      date: searchData.date
    });

    navigate(`/available-rides?${searchParams.toString()}`);
  };

  // Handle offer a seat button click
  const handleOfferSeat = () => {
    navigate('/post-ride');
  };

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
          <form className="bcDash-search-form" onSubmit={handleSearchRide}>
            {/* Pickup Location */}
            <div className="bcDash-input-group">
              <div className="bcDash-location-dot bcDash-pickup-dot"></div>
              <input 
                type="text" 
                name="pickup"
                placeholder="Enter pickup location" 
                className="bcDash-location-input bcDash-pickup-input"
                value={searchData.pickup}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Destination */}
            <div className="bcDash-input-group">
              <div className="bcDash-location-dot bcDash-destination-dot"></div>
              <input 
                type="text" 
                name="destination"
                placeholder="Enter destination" 
                className="bcDash-location-input bcDash-destination-input"
                value={searchData.destination}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Date Picker Input Group */}
            <div className="bcDash-input-group">
              <div className="bcDash-date-dot"></div>
              <input 
                type="date" 
                name="date"
                className="bcDash-location-input bcDash-date-input"
                placeholder="Choose date"
                value={searchData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                required
              />
            </div>

            <button type="submit" className="bcDash-search-btn">
              Search Ride
            </button>
          </form>
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
          <button 
            className="bcDash-offer-seat-btn"
            onClick={handleOfferSeat}
          >
            Offer a Seat
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

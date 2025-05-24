import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Available_rides.css';
import Navbar from '../Navbar/Navbar';

const BACKGROUND_IMAGE = '/backgroundimg.png';

const Available_rides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial search parameters from URL
  const urlParams = new URLSearchParams(location.search);
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    pickup: urlParams.get('origin') || '',
    destination: urlParams.get('destination') || '',
    date: urlParams.get('date') || ''
  });

  useEffect(() => {
    if (searchForm.pickup && searchForm.destination && searchForm.date) {
      fetchAvailableRides();
    }
  }, [searchForm.pickup, searchForm.destination, searchForm.date]);

  const fetchAvailableRides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for testing - using current search form values
      const mockData = [
        {
          "id": 1,
          "leader_id": 5,
          "origin": searchForm.pickup,
          "destination": searchForm.destination,
          "date": searchForm.date,
          "time": "06:30",
          "seats": 4,
          "seats_filled": 1,
          "price": 25.50,
          "duration": "3:30 hrs",
          "vehicle_type": "Car"
        },
        {
          "id": 2,
          "leader_id": 7,
          "origin": searchForm.pickup,
          "destination": searchForm.destination,
          "date": searchForm.date,
          "time": "08:15",
          "seats": 3,
          "seats_filled": 0,
          "price": 22.00,
          "duration": "3:45 hrs",
          "vehicle_type": "SUV"
        },
        {
          "id": 3,
          "leader_id": 8,
          "origin": searchForm.pickup,
          "destination": searchForm.destination,
          "date": searchForm.date,
          "time": "10:45",
          "seats": 4,
          "seats_filled": 2,
          "price": 30.00,
          "duration": "3:20 hrs",
          "vehicle_type": "Car"
        },
        {
          "id": 4,
          "leader_id": 12,
          "origin": searchForm.pickup,
          "destination": searchForm.destination,
          "date": searchForm.date,
          "time": "14:30",
          "seats": 3,
          "seats_filled": 1,
          "price": 28.75,
          "duration": "3:15 hrs",
          "vehicle_type": "Car"
        },
        {
          "id": 5,
          "leader_id": 15,
          "origin": searchForm.pickup,
          "destination": searchForm.destination,
          "date": searchForm.date,
          "time": "16:00",
          "seats": 4,
          "seats_filled": 0,
          "price": 26.25,
          "duration": "3:35 hrs",
          "vehicle_type": "SUV"
        },
        {
          "id": 6,
          "leader_id": 18,
          "origin": searchForm.pickup,
          "destination": searchForm.destination,
          "date": searchForm.date,
          "time": "18:15",
          "seats": 3,
          "seats_filled": 2,
          "price": 32.00,
          "duration": "3:25 hrs",
          "vehicle_type": "Car"
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setRides(mockData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchForm.pickup || !searchForm.destination || !searchForm.date) {
      alert('Please fill in all fields');
      return;
    }
    // The useEffect will automatically trigger fetchAvailableRides when form values change
  };

  // Swap pickup and destination
  const handleSwapLocations = () => {
    setSearchForm(prev => ({
      ...prev,
      pickup: prev.destination,
      destination: prev.pickup
    }));
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateArrivalTime = (departureTime, duration) => {
    const [hours, minutes] = departureTime.split(':');
    const [durationHours, durationMinutes] = duration.split(':');
    
    const departure = new Date();
    departure.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const arrival = new Date(departure);
    arrival.setHours(arrival.getHours() + parseInt(durationHours));
    arrival.setMinutes(arrival.getMinutes() + parseInt(durationMinutes));
    
    return arrival.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleBookRide = (rideId) => {
    console.log(`Booking ride with ID: ${rideId}`);
    alert(`Booking ride ${rideId}. This will redirect to booking page.`);
  };

  const handleBackToSearch = () => {
    navigate('/dashboard');
  };

  if (error) {
    return (
      <div className="bcRides-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
        <Navbar />
        <div className="bcRides-error">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleBackToSearch} className="bcRides-back-btn">Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bcRides-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
      <Navbar />
      
      <div className="bcRides-main-content">
        {/* Search Form */}
        <div className="bcRides-search-section">
          <form onSubmit={handleSearch} className="bcRides-search-form">
            <div className="bcRides-search-inputs">
              <div className="bcRides-input-group">
                <label className="bcRides-input-label">From</label>
                <input
                  type="text"
                  name="pickup"
                  value={searchForm.pickup}
                  onChange={handleInputChange}
                  placeholder="Enter pickup location"
                  className="bcRides-location-input"
                  required
                />
              </div>

              <button 
                type="button" 
                onClick={handleSwapLocations}
                className="bcRides-swap-btn"
                title="Swap locations"
              >
                ⇄
              </button>

              <div className="bcRides-input-group">
                <label className="bcRides-input-label">To</label>
                <input
                  type="text"
                  name="destination"
                  value={searchForm.destination}
                  onChange={handleInputChange}
                  placeholder="Enter destination"
                  className="bcRides-location-input"
                  required
                />
              </div>

              <div className="bcRides-input-group">
                <label className="bcRides-input-label">Departure</label>
                <input
                  type="date"
                  name="date"
                  value={searchForm.date}
                  onChange={handleInputChange}
                  className="bcRides-date-input"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <button type="submit" className="bcRides-search-btn">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="bcRides-loading">
            <div className="bcRides-spinner"></div>
            <p>Finding available rides...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="bcRides-results-info">
              <span className="bcRides-results-count">{rides.length} results</span>
            </div>

            {/* Rides List */}
            <div className="bcRides-content-wrapper">
              {rides.length === 0 ? (
                <div className="bcRides-no-rides">
                  <div className="bcRides-no-rides-icon">🚗</div>
                  <h3>No rides found</h3>
                  <p>Try adjusting your search or check back later for new rides.</p>
                  <button onClick={handleBackToSearch} className="bcRides-back-btn">
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <div className="bcRides-list">
                  {rides.map((ride) => (
                    <div key={ride.id} className="bcRides-card">
                      <div className="bcRides-card-content">
                        {/* Time and Route Section */}
                        <div className="bcRides-time-route">
                          <div className="bcRides-time-info">
                            <span className="bcRides-departure-time">{formatTime(ride.time)}</span>
                            <span className="bcRides-duration">{ride.duration}</span>
                            <span className="bcRides-arrival-time">{calculateArrivalTime(ride.time, ride.duration)}</span>
                          </div>
                          <div className="bcRides-route-info">
                            <span className="bcRides-route-text">{ride.origin} - {ride.destination}</span>
                          </div>
                        </div>

                        {/* Vehicle and Seats Info */}
                        <div className="bcRides-vehicle-info">
                          <div className="bcRides-vehicle-details">
                            <span className="bcRides-vehicle-type">{ride.vehicle_type}</span>
                            <div className="bcRides-seats-display">
                              <span className="bcRides-seats-text">
                                {ride.seats - ride.seats_filled} seats available
                              </span>
                              <div className="bcRides-seats-visual">
                                {[...Array(ride.seats)].map((_, index) => (
                                  <div 
                                    key={index} 
                                    className={`bcRides-seat-icon ${index < ride.seats_filled ? 'filled' : 'empty'}`}
                                  >
                                    👤
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price and Book Section */}
                        <div className="bcRides-price-book">
                          <div className="bcRides-price-info">
                            <span className="bcRides-price">${ride.price}</span>
                          </div>
                          <button 
                            onClick={() => handleBookRide(ride.id)}
                            className="bcRides-book-btn"
                            disabled={ride.seats - ride.seats_filled === 0}
                          >
                            {ride.seats - ride.seats_filled === 0 ? 'Fully Booked' : 'Book Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Available_rides;

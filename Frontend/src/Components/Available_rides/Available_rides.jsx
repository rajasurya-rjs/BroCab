import React, { useState, useEffect, useCallback } from 'react';
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
    origin: urlParams.get('origin')?.trim() || '',
    destination: urlParams.get('destination')?.trim() || '',
    date: urlParams.get('date')?.trim() || ''
  });

  // Memoize the fetch function to prevent multiple calls
  const fetchAvailableRides = useCallback(async () => {
    if (!searchForm.origin || !searchForm.destination || !searchForm.date) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Build API URL with query parameters
      const apiParams = new URLSearchParams({
        origin: searchForm.origin.trim(),
        destination: searchForm.destination.trim(),
        date: searchForm.date.trim()
      });
      
      const apiUrl = `http://localhost:8080/ride/filter?${apiParams.toString()}`;
      console.log('Making API call to:', apiUrl);
      
      // Make API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Server error. Please check your backend logs for details.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response received:', data);
      
      // Handle the response
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Single object response
        setRides([data]);
      } else if (Array.isArray(data)) {
        // Array response
        setRides(data);
      } else if (data === null || data === undefined) {
        // No data found
        setRides([]);
      } else {
        // Unexpected response format
        console.warn('Unexpected response format:', data);
        setRides([]);
      }
      
    } catch (err) {
      console.error('Error fetching rides:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(`Failed to fetch rides: ${err.message}`);
      }
      setRides([]);
    } finally {
      setLoading(false);
    }
  }, [searchForm.origin, searchForm.destination, searchForm.date]);

  // Use effect with proper dependency array
  useEffect(() => {
    fetchAvailableRides();
  }, [fetchAvailableRides]);

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
    
    const trimmedOrigin = searchForm.origin.trim();
    const trimmedDestination = searchForm.destination.trim();
    const trimmedDate = searchForm.date.trim();
    
    if (!trimmedOrigin || !trimmedDestination || !trimmedDate) {
      alert('Please fill in all fields');
      return;
    }
    
    // Update form with trimmed values
    setSearchForm({
      origin: trimmedOrigin,
      destination: trimmedDestination,
      date: trimmedDate
    });
  };

  // Swap pickup and destination
  const handleSwapLocations = () => {
    setSearchForm(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time;
    }
  };

  const calculateArrivalTime = (departureTime, duration) => {
    if (!departureTime || !duration) return 'N/A';
    
    try {
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
    } catch (error) {
      return 'N/A';
    }
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
          <button onClick={fetchAvailableRides} className="bcRides-retry-btn" style={{marginLeft: '10px'}}>
            Retry
          </button>
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
                  name="origin"
                  value={searchForm.origin}
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

              <button type="submit" className="bcRides-search-btn" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
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
            <div className="bcRides-results-info">
              <span className="bcRides-results-count">{rides.length} results</span>
            </div>

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
                  {rides.map((ride, index) => (
                    <div key={ride.id || index} className="bcRides-card">
                      <div className="bcRides-card-content">
                        <div className="bcRides-time-route">
                          <div className="bcRides-time-info">
                            <span className="bcRides-departure-time">{formatTime(ride.time)}</span>
                            <span className="bcRides-duration">{ride.duration || 'N/A'}</span>
                            <span className="bcRides-arrival-time">{calculateArrivalTime(ride.time, ride.duration)}</span>
                          </div>
                          <div className="bcRides-route-info">
                            <span className="bcRides-route-text">{ride.origin} - {ride.destination}</span>
                          </div>
                        </div>

                        <div className="bcRides-vehicle-info">
                          <div className="bcRides-vehicle-details">
                            <span className="bcRides-vehicle-type">{ride.vehicle_type || 'Car'}</span>
                            <div className="bcRides-seats-display">
                              <span className="bcRides-seats-text">
                                {(ride.seats || 0) - (ride.seats_filled || 0)} seats available
                              </span>
                              <div className="bcRides-seats-visual">
                                {[...Array(ride.seats || 4)].map((_, seatIndex) => (
                                  <div 
                                    key={seatIndex} 
                                    className={`bcRides-seat-icon ${seatIndex < (ride.seats_filled || 0) ? 'filled' : 'empty'}`}
                                  >
                                    👤
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bcRides-price-book">
                          <div className="bcRides-price-info">
                            <span className="bcRides-price">${ride.price || '0'}</span>
                          </div>
                          <button 
                            onClick={() => handleBookRide(ride.id)}
                            className="bcRides-book-btn"
                            disabled={(ride.seats || 0) - (ride.seats_filled || 0) === 0}
                          >
                            {(ride.seats || 0) - (ride.seats_filled || 0) === 0 ? 'Fully Booked' : 'Book Now'}
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

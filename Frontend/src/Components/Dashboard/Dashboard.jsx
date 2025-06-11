import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from '../Navbar/Navbar';

const BACKGROUND_IMAGE = '/backgroundimg.png';

// Optimized debounce with shorter delay
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // State for search form
  const [searchData, setSearchData] = useState({
    pickup: '',
    destination: '',
    date: ''
  });

  // State for offer ride form
  const [offerData, setOfferData] = useState({
    pickup: '',
    destination: '',
    date: '',
    time: '',
    seats: 1,
    price: ''
  });

  // Location suggestions state
  const [searchSuggestions, setSearchSuggestions] = useState({
    pickup: [],
    destination: []
  });
  const [offerSuggestions, setOfferSuggestions] = useState({
    pickup: [],
    destination: []
  });
  const [showSearchSuggestions, setShowSearchSuggestions] = useState({
    pickup: false,
    destination: false
  });
  const [showOfferSuggestions, setShowOfferSuggestions] = useState({
    pickup: false,
    destination: false
  });
  const [loadingSuggestions, setLoadingSuggestions] = useState({
    searchPickup: false,
    searchDestination: false,
    offerPickup: false,
    offerDestination: false
  });

  // Geolocation states
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    requestUserLocation();
  }, []);

  // OPTIMIZED PREMIUM LOCATIONS DATABASE - More comprehensive for instant results
  const PREMIUM_LOCATIONS = [
    {
      keywords: ['scaler', 'scaler micro', 'scaler micro campus', 'scaler school', 'scaler academy','scaler school of technology','electronic city','electronic city phase 1','electronic city phase one'],
      name: 'Scaler Micro Campus',
      display_name: 'Scaler Micro Campus, Skyward Tech Park, PARADISE BUILDING, 47/11, Velankani Drive, opposite Velankani Tech Park, next to SJR EQUINOX, Electronics City Phase 1, Electronic City, Bengaluru, Karnataka 560100',
      lat: 12.8456,
      lon: 77.6632,
      type: 'education',
      category: 'Tech Campus',
      verified: false
    },
    {
      keywords: ['uniworld', 'uniworld 2', 'uniworld city', 'uniworld apartments'],
      name: 'Uniworld 2',
      display_name: 'Uniworld 2, 103/2 Neeladri Road, Doddathogur, Electronic City Phase 1, Electronic City, Bengaluru, Karnataka 560100',
      lat: 12.8398,
      lon: 77.6745,
      type: 'residential',
      category: 'Apartment Complex',
      verified: false
    },
    {
      keywords: ['stanza', 'stanza lisbon', 'stanza living lisbon', 'lisbon', 'stanza living'],
      name: 'Stanza Living Lisbon',
      display_name: 'Stanza Living Lisbon, Electronic City Phase 1, Electronic City, Bengaluru, Karnataka 560100',
      lat: 12.8445,
      lon: 77.6678,
      type: 'accommodation',
      category: 'Co-living Space',
      verified: false
    },
    {
      keywords: ['airport', 'kempegowda', 'bangalore airport', 'blr airport', 'international airport', 'bengaluru airport'],
      name: 'Kempegowda International Airport',
      display_name: 'Kempegowda International Airport (BLR), Devanahalli, Bengaluru, Karnataka 560300',
      lat: 13.1986,
      lon: 77.7066,
      type: 'airport',
      category: 'International Airport',
      verified: false
    },
    {
      keywords: ['ksr bangalore railway junction', 'ksr', 'bangalore railway station', 'majestic railway station', 'krantivira sangolli rayanna', 'majestic', 'bangalore city railway station'],
      name: 'KSR Bangalore Railway Junction',
      display_name: 'Krantivira Sangolli Rayanna (KSR) Bangalore Railway Station, Majestic, Bengaluru, Karnataka 560023',
      lat: 12.9763,
      lon: 77.5619,
      type: 'railway_station',
      category: 'Railway Station',
      verified: false
    },
    {
      keywords: ['smvt bengaluru railway station', 'smvt', 'smvt railway station', 'sir m visvesvaraya terminal'],
      name: 'SMVT Bengaluru Railway Station',
      display_name: 'Sir M. Visvesvaraya Terminal (SMVT) Bengaluru, Devanahalli, Bengaluru, Karnataka 560300',
      lat: 13.1986,
      lon: 77.7066,
      type: 'railway_station',
      category: 'Railway Station',
      verified: false
    },
    {
      keywords: ['yeswanthpur railway station', 'yeswanthpur', 'yeswanthpur station', 'yeswanthpur junction', 'ypr'],
      name: 'Yeswanthpur Railway Station',
      display_name: 'Yeswanthpur Junction, Bengaluru, Karnataka 560022',
      lat: 13.0156,
      lon: 77.5571,
      type: 'railway_station',
      category: 'Railway Station',
      verified: false
    },
    {
      keywords: ['electronic city', 'e city', 'ec', 'electronics city', 'electronic city phase 1', 'electronic city phase 2'],
      name: 'Electronic City',
      display_name: 'Electronic City, Bengaluru, Karnataka 560100',
      lat: 12.8456,
      lon: 77.6632,
      type: 'area',
      category: 'Tech Hub',
      verified: false
    },
    {
      keywords: ['koramangala', 'koramangala 5th block', '5th block', 'koramangala 4th block', 'koramangala 6th block'],
      name: 'Koramangala 5th Block',
      display_name: 'Koramangala 5th Block, Bengaluru, Karnataka 560095',
      lat: 12.9352,
      lon: 77.6245,
      type: 'area',
      category: 'Commercial Area',
      verified: false
    },
    {
      keywords: ['whitefield', 'white field', 'itpl', 'brookefield', 'varthur'],
      name: 'Whitefield',
      display_name: 'Whitefield, Bengaluru, Karnataka 560066',
      lat: 12.9698,
      lon: 77.7500,
      type: 'area',
      category: 'IT Hub',
      verified: false
    },
    {
      keywords: ['mg road', 'mahatma gandhi road', 'brigade road', 'commercial street'],
      name: 'MG Road',
      display_name: 'MG Road, Bengaluru, Karnataka 560001',
      lat: 12.9716,
      lon: 77.5946,
      type: 'area',
      category: 'Shopping District',
      verified: false
    },
    // Add more popular locations for instant results
    {
      keywords: ['silk board', 'silkboard', 'silk board junction', 'btm layout'],
      name: 'Silk Board Junction',
      display_name: 'Silk Board Junction, BTM Layout, Bengaluru, Karnataka 560076',
      lat: 12.9165,
      lon: 77.6101,
      type: 'junction',
      category: 'Major Junction',
      verified: false
    },
    {
      keywords: ['indiranagar', 'indira nagar', '100 feet road', 'indiranagar metro'],
      name: 'Indiranagar',
      display_name: 'Indiranagar, Bengaluru, Karnataka 560038',
      lat: 12.9719,
      lon: 77.6412,
      type: 'area',
      category: 'Residential Area',
      verified: false
    },
    {
      keywords: ['banashankari', 'bsk', 'banashankari 2nd stage', 'banashankari 3rd stage'],
      name: 'Banashankari',
      display_name: 'Banashankari, Bengaluru, Karnataka 560070',
      lat: 12.9250,
      lon: 77.5667,
      type: 'area',
      category: 'Residential Area',
      verified: false
    },
    {
      keywords: ['jayanagar', 'jaya nagar', 'jayanagar 4th block', 'jayanagar 9th block'],
      name: 'Jayanagar',
      display_name: 'Jayanagar, Bengaluru, Karnataka 560041',
      lat: 12.9279,
      lon: 77.5937,
      type: 'area',
      category: 'Residential Area',
      verified: false
    }
  ];

  // Cache for API results to avoid repeated calls
  const [apiCache, setApiCache] = useState(new Map());

  // NUCLEAR SOLUTION: IP-based location with GPS fallback
  const getLocationNuclear = async () => {
    try {
      // Try IP location first (always works)
      console.log('🔥 Trying IP location...');
      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();
      
      if (ipData.latitude && ipData.longitude) {
        console.log('✅ IP location success:', ipData);
        return {
          lat: ipData.latitude,
          lon: ipData.longitude,
          accuracy: 10000,
          source: 'ip'
        };
      }
    } catch (error) {
      console.log('❌ IP location failed:', error);
    }

    // Fallback to GPS if IP fails
    try {
      console.log('🔄 Trying GPS location...');
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, // Less accurate but more reliable
          timeout: 10000,
          maximumAge: 600000
        });
      });
      
      console.log('✅ GPS location success:', position);
      return {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
        source: 'gps'
      };
    } catch (error) {
      console.log('❌ GPS location failed:', error);
      throw new Error('All location methods failed');
    }
  };

  // Request user location with nuclear method
  const requestUserLocation = async () => {
    try {
      const location = await getLocationNuclear();
      setUserLocation(location);
      console.log('User location obtained:', location);
    } catch (error) {
      console.log('Location access denied or failed:', error);
    }
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Reverse geocoding
  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (error) {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  // SUPER OPTIMIZED: Lightning fast location search
  const getSmartLocations = async (query, userLocation = null) => {
    if (query.length < 2) return [];
    
    const searchQuery = query.toLowerCase().trim();
    
    // Check cache first for instant results
    const cacheKey = `${searchQuery}_${userLocation?.lat}_${userLocation?.lon}`;
    if (apiCache.has(cacheKey)) {
      console.log('Cache hit for:', searchQuery);
      return apiCache.get(cacheKey);
    }

    const results = [];

    // 1. INSTANT: Check hardcoded premium locations first (always instant)
    const hardcodedMatches = PREMIUM_LOCATIONS.filter(location => 
      location.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchQuery) || 
        searchQuery.includes(keyword.toLowerCase())
      )
    ).map(location => ({
      ...location,
      source: 'premium',
      priority: 1,
      distance: userLocation ? calculateDistance(
        userLocation.lat, userLocation.lon,
        location.lat, location.lon
      ) : null
    }));

    results.push(...hardcodedMatches);

    // 2. Add "Your Location" option if user location available
    if (userLocation && (searchQuery.includes('your') || searchQuery.includes('current') || searchQuery.includes('my'))) {
      const currentLocationAddress = await reverseGeocode(userLocation.lat, userLocation.lon);
      results.push({
        name: 'Your Current Location',
        display_name: `Your Location: ${currentLocationAddress}`,
        lat: userLocation.lat,
        lon: userLocation.lon,
        type: 'current_location',
        category: 'GPS Location',
        source: 'gps',
        priority: 1,
        distance: 0,
        verified: false,
        isCurrentLocation: true
      });
    }

    // 3. FAST: Only use Nominatim (skip slow Overpass API)
    try {
      const nominatimController = new AbortController();
      const timeoutId = setTimeout(() => nominatimController.abort(), 3000); // 3 second timeout

      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=8&addressdetails=1`,
        { signal: nominatimController.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        
        const nominatimResults = nominatimData.map(item => ({
          name: item.display_name.split(',')[0],
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          type: item.type || 'place',
          category: item.class || 'Location',
          source: 'nominatim',
          priority: 2,
          place_id: item.place_id,
          distance: userLocation ? calculateDistance(
            userLocation.lat, userLocation.lon,
            parseFloat(item.lat), parseFloat(item.lon)
          ) : null,
          verified: false
        }));

        results.push(...nominatimResults);
      }
    } catch (error) {
      console.log('Nominatim timeout or error:', error);
      // Continue with hardcoded results even if API fails
    }

    // 4. SORT AND DEDUPLICATE
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => 
        Math.abs(r.lat - result.lat) < 0.001 && 
        Math.abs(r.lon - result.lon) < 0.001
      )
    );

    // Sort by priority first, then by distance if available
    const sortedResults = uniqueResults
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        return 0;
      })
      .slice(0, 12); // Show top 12 results

    // Cache the results for 5 minutes
    setApiCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cacheKey, sortedResults);
      
      // Clean old cache entries (keep only last 50)
      if (newCache.size > 50) {
        const firstKey = newCache.keys().next().value;
        newCache.delete(firstKey);
      }
      
      return newCache;
    });

    return sortedResults;
  };

  // SUPER FAST debounced search function (reduced delay)
  const debouncedLocationSearch = useCallback(
    debounce(async (query, fieldName, formType) => {
      if (query.length > 1) {
        const loadingKey = `${formType}${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
        setLoadingSuggestions(prev => ({
          ...prev,
          [loadingKey]: true
        }));
        
        const suggestions = await getSmartLocations(query, userLocation);
        
        if (formType === 'search') {
          setSearchSuggestions(prev => ({
            ...prev,
            [fieldName]: suggestions
          }));
          setShowSearchSuggestions(prev => ({
            ...prev,
            [fieldName]: true
          }));
        } else {
          setOfferSuggestions(prev => ({
            ...prev,
            [fieldName]: suggestions
          }));
          setShowOfferSuggestions(prev => ({
            ...prev,
            [fieldName]: true
          }));
        }
        
        setLoadingSuggestions(prev => ({
          ...prev,
          [loadingKey]: false
        }));
      } else {
        if (formType === 'search') {
          setShowSearchSuggestions(prev => ({
            ...prev,
            [fieldName]: false
          }));
        } else {
          setShowOfferSuggestions(prev => ({
            ...prev,
            [fieldName]: false
          }));
        }
      }
    }, 150), // Reduced from 300ms to 150ms for faster response
    [userLocation, apiCache]
  );

  // NUCLEAR useCurrentLocation function
  const useCurrentLocation = async (fieldName, formType) => {
    setGettingLocation(true);
    
    try {
      console.log('🚀 Getting location with nuclear method...');
      
      let location = userLocation;
      
      if (!location) {
        location = await getLocationNuclear();
        setUserLocation(location);
        console.log('📍 Location obtained:', location);
      }
      
      const address = await reverseGeocode(location.lat, location.lon);
      console.log('📍 Address:', address);
      
      if (formType === 'search') {
        setSearchData(prev => ({
          ...prev,
          [fieldName]: address
        }));
      } else {
        setOfferData(prev => ({
          ...prev,
          [fieldName]: address
        }));
      }
      
      // Show success message
      alert(`✅ Location found: ${address.split(',')[0]}`);
      
    } catch (error) {
      console.error('💥 Nuclear location failed:', error);
      alert('Location services unavailable. Please enter your location manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  // Handle tab switching
  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  // Handle CTA button clicks
  const handleCTAClick = (tab) => {
    setActiveTab(tab);
    
    const heroSection = document.querySelector('.bcDash-hero-section');
    if (heroSection) {
      heroSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'pickup' || name === 'destination') {
      debouncedLocationSearch(value, name, 'search');
    }
  };

  // Handle suggestion selection for search form
  const handleSearchSuggestionSelect = (suggestion, fieldName) => {
    setSearchData(prev => ({
      ...prev,
      [fieldName]: suggestion.display_name
    }));
    setShowSearchSuggestions(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  // Enhanced offer input changes with time formatting
  const handleOfferInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'time') {
      let formattedValue = value;
      
      formattedValue = formattedValue.replace(/[^\d:]/g, '');
      
      if (formattedValue.length === 2 && !formattedValue.includes(':')) {
        formattedValue = formattedValue + ':';
      } else if (formattedValue.length === 3 && formattedValue.charAt(2) !== ':') {
        formattedValue = formattedValue.substring(0, 2) + ':' + formattedValue.substring(2);
      }
      
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.substring(0, 5);
      }
      
      const colonIndex = formattedValue.indexOf(':');
      if (colonIndex !== -1) {
        const hours = formattedValue.substring(0, colonIndex);
        const minutes = formattedValue.substring(colonIndex + 1);
        
        if (hours && parseInt(hours) > 23) {
          formattedValue = '23:' + minutes;
        }
        
        if (minutes && parseInt(minutes) > 59) {
          formattedValue = hours + ':59';
        }
      }
      
      setOfferData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setOfferData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (name === 'pickup' || name === 'destination') {
        debouncedLocationSearch(value, name, 'offer');
      }
    }
  };

  // Handle suggestion selection for offer form
  const handleOfferSuggestionSelect = (suggestion, fieldName) => {
    setOfferData(prev => ({
      ...prev,
      [fieldName]: suggestion.display_name
    }));
    setShowOfferSuggestions(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchSuggestions({ pickup: false, destination: false });
      setShowOfferSuggestions({ pickup: false, destination: false });
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle search ride
  const handleSearchRide = (e) => {
    e.preventDefault();
    
    if (!searchData.pickup || !searchData.destination || !searchData.date) {
      alert('Please fill in all fields before searching');
      return;
    }

    const searchParams = new URLSearchParams({
      origin: searchData.pickup,
      destination: searchData.destination,
      date: searchData.date
    });

    navigate(`/available-rides?${searchParams.toString()}`);
  };

  // Handle offer ride
  const handleOfferRide = (e) => {
    e.preventDefault();
    
    if (!offerData.pickup || !offerData.destination || !offerData.date || !offerData.time || !offerData.price) {
      alert('Please fill in all required fields');
      return;
    }

    navigate('/post-ride', { state: offerData });
  };

  return (
    <div className={`bcDash-container ${isLoaded ? 'loaded' : ''}`} style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
      <Navbar />
      
      {/* Smooth Floating Particles */}
      <div className="bcDash-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="bcDash-particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
            }}
          ></div>
        ))}
      </div>
      
      <div className="bcDash-main-content">
        <div className="bcDash-hero-section">
          {/* Hero Text Box */}
          <div className="bcDash-hero-text">
            <div className="bcDash-hero-title-box">
              <h1 className="bcDash-hero-title">Share the Journey.</h1>
              <h1 className="bcDash-hero-subtitle">Split the Cost.</h1>
            </div>
          </div>

          {/* Premium Tab Switcher */}
          <div className="bcDash-premium-tab-container">
            <div className="bcDash-tab-background">
              <div className={`bcDash-liquid-indicator ${activeTab === 'search' ? 'search-active' : 'offer-active'}`}></div>
            </div>
            
            <button 
              className={`bcDash-premium-tab bcDash-search-tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('search')}
              type="button"
            >
              <div className="bcDash-tab-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className="bcDash-tab-text">Find a Ride</span>
            </button>
            
            <button 
              className={`bcDash-premium-tab bcDash-offer-tab ${activeTab === 'offer' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('offer')}
              type="button"
            >
              <div className="bcDash-tab-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v6a2 2 0 002 2h4a2 2 0 002-2v-6m-6 0h6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className="bcDash-tab-text">Offer a Ride</span>
            </button>
          </div>

          {/* Premium Form Container */}
          <div className={`bcDash-premium-form-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
            {/* Search Form */}
            {activeTab === 'search' && (
              <form className="bcDash-premium-form bcDash-search-form" onSubmit={handleSearchRide}>
                <div className="bcDash-form-header">
                  <h3 className="bcDash-form-title">Looking for a ride?</h3>
                  <p className="bcDash-form-subtitle">Find available rides going your way</p>
                </div>
                
                <div className="bcDash-premium-inputs">
                  {/* Enhanced Pickup Location - CURRENT LOCATION BUTTON REMOVED */}
                  <div className="bcDash-premium-input-group" onClick={(e) => e.stopPropagation()}>
                    <div className="bcDash-input-icon bcDash-pickup-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      name="pickup"
                      placeholder="Enter pickup location" 
                      className="bcDash-premium-input"
                      value={searchData.pickup}
                      onChange={handleSearchInputChange}
                      autoComplete="off"
                      required
                    />
                    
                    <div className="bcDash-input-focus-line"></div>
                    
                    {/* Loading indicator */}
                    {loadingSuggestions.searchPickup && (
                      <div className="bcDash-suggestions-loading">
                        <div className="bcDash-loading-spinner"></div>
                        <span>Finding locations...</span>
                      </div>
                    )}
                    
                    {/* OPTIMIZED Enhanced Suggestions */}
                    {showSearchSuggestions.pickup && searchSuggestions.pickup.length > 0 && !loadingSuggestions.searchPickup && (
                      <div className="bcDash-suggestions-dropdown">
                        {searchSuggestions.pickup.map((suggestion, index) => (
                          <div 
                            key={suggestion.osm_id || suggestion.place_id || index}
                            className={`bcDash-suggestion-item ${suggestion.isCurrentLocation ? 'current-location' : ''}`}
                            onClick={() => handleSearchSuggestionSelect(suggestion, 'pickup')}
                          >
                            <div className="bcDash-suggestion-icon-wrapper">
                              <div className="bcDash-suggestion-icon">
                                {suggestion.isCurrentLocation ? '📍' : '📍'}
                              </div>
                            </div>
                            <div className="bcDash-suggestion-content">
                              <div className="bcDash-suggestion-name">
                                {suggestion.name}
                              </div>
                              <div className="bcDash-suggestion-text">
                                {suggestion.display_name}
                              </div>
                              <div className="bcDash-suggestion-meta">
                                <span className={`bcDash-suggestion-category ${suggestion.source}`}>
                                  {suggestion.category}
                                </span>
                                {suggestion.distance !== null && suggestion.distance !== undefined && (
                                  <span className="bcDash-suggestion-distance">
                                    {suggestion.distance.toFixed(1)} km away
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Destination - CURRENT LOCATION BUTTON REMOVED */}
                  <div className="bcDash-premium-input-group" onClick={(e) => e.stopPropagation()}>
                    <div className="bcDash-input-icon bcDash-destination-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      name="destination"
                      placeholder="Enter destination" 
                      className="bcDash-premium-input"
                      value={searchData.destination}
                      onChange={handleSearchInputChange}
                      autoComplete="off"
                      required
                    />
                    
                    <div className="bcDash-input-focus-line"></div>
                    
                    {/* Loading indicator */}
                    {loadingSuggestions.searchDestination && (
                      <div className="bcDash-suggestions-loading">
                        <div className="bcDash-loading-spinner"></div>
                        <span>Finding locations...</span>
                      </div>
                    )}
                    
                    {/* OPTIMIZED Enhanced Suggestions */}
                    {showSearchSuggestions.destination && searchSuggestions.destination.length > 0 && !loadingSuggestions.searchDestination && (
                      <div className="bcDash-suggestions-dropdown">
                        {searchSuggestions.destination.map((suggestion, index) => (
                          <div 
                            key={suggestion.osm_id || suggestion.place_id || index}
                            className={`bcDash-suggestion-item ${suggestion.isCurrentLocation ? 'current-location' : ''}`}
                            onClick={() => handleSearchSuggestionSelect(suggestion, 'destination')}
                          >
                            <div className="bcDash-suggestion-icon-wrapper">
                              <div className="bcDash-suggestion-icon">
                                {suggestion.isCurrentLocation ? '📍' : '🎯'}
                              </div>
                            </div>
                            <div className="bcDash-suggestion-content">
                              <div className="bcDash-suggestion-name">
                                {suggestion.name}
                              </div>
                              <div className="bcDash-suggestion-text">
                                {suggestion.display_name}
                              </div>
                              <div className="bcDash-suggestion-meta">
                                <span className={`bcDash-suggestion-category ${suggestion.source}`}>
                                  {suggestion.category}
                                </span>
                                {suggestion.distance !== null && suggestion.distance !== undefined && (
                                  <span className="bcDash-suggestion-distance">
                                    {suggestion.distance.toFixed(1)} km away
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bcDash-premium-input-group">
                    <div className="bcDash-input-icon bcDash-date-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <input 
                      type="date" 
                      name="date"
                      className="bcDash-premium-input bcDash-date-input"
                      value={searchData.date}
                      onChange={handleSearchInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <div className="bcDash-input-focus-line"></div>
                  </div>
                </div>

                <button type="submit" className="bcDash-premium-btn bcDash-search-btn">
                  <span className="bcDash-btn-text">Search Rides</span>
                  <div className="bcDash-btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="bcDash-btn-ripple"></div>
                </button>
              </form>
            )}

            {/* Offer Ride Form - Similar optimizations */}
            {activeTab === 'offer' && (
              <form className="bcDash-premium-form bcDash-offer-form" onSubmit={handleOfferRide}>
                <div className="bcDash-form-header">
                  <h3 className="bcDash-form-title">Got a ride to share?</h3>
                  <p className="bcDash-form-subtitle">Post your route and find travel buddies</p>
                </div>
                
                <div className="bcDash-premium-inputs">
                  <div className="bcDash-input-row">
                    {/* Enhanced Pickup Location - CURRENT LOCATION BUTTON REMOVED */}
                    <div className="bcDash-premium-input-group" onClick={(e) => e.stopPropagation()}>
                      <div className="bcDash-input-icon bcDash-pickup-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        name="pickup"
                        placeholder="Pickup location" 
                        className="bcDash-premium-input"
                        value={offerData.pickup}
                        onChange={handleOfferInputChange}
                        autoComplete="off"
                        required
                      />
                      
                      <div className="bcDash-input-focus-line"></div>
                      
                      {/* Loading indicator */}
                      {loadingSuggestions.offerPickup && (
                        <div className="bcDash-suggestions-loading">
                          <div className="bcDash-loading-spinner"></div>
                          <span>Finding locations...</span>
                        </div>
                      )}
                      
                      {/* OPTIMIZED Enhanced Suggestions */}
                      {showOfferSuggestions.pickup && offerSuggestions.pickup.length > 0 && !loadingSuggestions.offerPickup && (
                        <div className="bcDash-suggestions-dropdown">
                          {offerSuggestions.pickup.map((suggestion, index) => (
                            <div 
                              key={suggestion.osm_id || suggestion.place_id || index}
                              className={`bcDash-suggestion-item ${suggestion.isCurrentLocation ? 'current-location' : ''}`}
                              onClick={() => handleOfferSuggestionSelect(suggestion, 'pickup')}
                            >
                              <div className="bcDash-suggestion-icon-wrapper">
                                <div className="bcDash-suggestion-icon">
                                  {suggestion.isCurrentLocation ? '📍' : '📍'}
                                </div>
                              </div>
                              <div className="bcDash-suggestion-content">
                                <div className="bcDash-suggestion-name">
                                  {suggestion.name}
                                </div>
                                <div className="bcDash-suggestion-text">
                                  {suggestion.display_name}
                                </div>
                                <div className="bcDash-suggestion-meta">
                                  <span className={`bcDash-suggestion-category ${suggestion.source}`}>
                                    {suggestion.category}
                                  </span>
                                  {suggestion.distance !== null && suggestion.distance !== undefined && (
                                    <span className="bcDash-suggestion-distance">
                                      {suggestion.distance.toFixed(1)} km away
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced Destination - CURRENT LOCATION BUTTON REMOVED */}
                    <div className="bcDash-premium-input-group" onClick={(e) => e.stopPropagation()}>
                      <div className="bcDash-input-icon bcDash-destination-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        name="destination"
                        placeholder="Destination" 
                        className="bcDash-premium-input"
                        value={offerData.destination}
                        onChange={handleOfferInputChange}
                        autoComplete="off"
                        required
                      />
                      
                      <div className="bcDash-input-focus-line"></div>
                      
                      {/* Loading indicator */}
                      {loadingSuggestions.offerDestination && (
                        <div className="bcDash-suggestions-loading">
                          <div className="bcDash-loading-spinner"></div>
                          <span>Finding locations...</span>
                        </div>
                      )}
                      
                      {/* OPTIMIZED Enhanced Suggestions */}
                      {showOfferSuggestions.destination && offerSuggestions.destination.length > 0 && !loadingSuggestions.offerDestination && (
                        <div className="bcDash-suggestions-dropdown">
                          {offerSuggestions.destination.map((suggestion, index) => (
                            <div 
                              key={suggestion.osm_id || suggestion.place_id || index}
                              className={`bcDash-suggestion-item ${suggestion.isCurrentLocation ? 'current-location' : ''}`}
                              onClick={() => handleOfferSuggestionSelect(suggestion, 'destination')}
                            >
                              <div className="bcDash-suggestion-icon-wrapper">
                                <div className="bcDash-suggestion-icon">
                                  {suggestion.isCurrentLocation ? '📍' : '🎯'}
                                </div>
                              </div>
                              <div className="bcDash-suggestion-content">
                                <div className="bcDash-suggestion-name">
                                  {suggestion.name}
                                </div>
                                <div className="bcDash-suggestion-text">
                                  {suggestion.display_name}
                                </div>
                                <div className="bcDash-suggestion-meta">
                                  <span className={`bcDash-suggestion-category ${suggestion.source}`}>
                                    {suggestion.category}
                                  </span>
                                  {suggestion.distance !== null && suggestion.distance !== undefined && (
                                    <span className="bcDash-suggestion-distance">
                                      {suggestion.distance.toFixed(1)} km away
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bcDash-input-row">
                    <div className="bcDash-premium-input-group">
                      <div className="bcDash-input-icon bcDash-date-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <input 
                        type="date" 
                        name="date"
                        className="bcDash-premium-input bcDash-date-input"
                        value={offerData.date}
                        onChange={handleOfferInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <div className="bcDash-input-focus-line"></div>
                    </div>

                    <div className="bcDash-premium-input-group">
                      <div className="bcDash-input-icon bcDash-time-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        name="time"
                        className="bcDash-premium-input bcDash-time-input"
                        value={offerData.time}
                        onChange={handleOfferInputChange}
                        placeholder="HH:MM (e.g., 14:30)"
                        pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                        title="Please enter time in HH:MM format (24-hour)"
                        maxLength="5"
                        required
                      />
                      <div className="bcDash-input-focus-line"></div>
                    </div>
                  </div>

                  <div className="bcDash-input-row">
                    <div className="bcDash-premium-input-group">
                      <div className="bcDash-input-icon bcDash-seats-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <select 
                        name="seats"
                        className="bcDash-premium-input bcDash-select-input"
                        value={offerData.seats}
                        onChange={handleOfferInputChange}
                        required
                      >
                        <option value={1}>1 Seat Available</option>
                        <option value={2}>2 Seats Available</option>
                        <option value={3}>3 Seats Available</option>
                        <option value={4}>4 Seats Available</option>
                      </select>
                      <div className="bcDash-input-focus-line"></div>
                    </div>

                    <div className="bcDash-premium-input-group">
                      <div className="bcDash-input-icon bcDash-price-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <input 
                        type="number" 
                        name="price"
                        placeholder="Price per person (₹)" 
                        className="bcDash-premium-input bcDash-price-input"
                        value={offerData.price}
                        onChange={handleOfferInputChange}
                        min="1"
                        step="0.01"
                        required
                      />
                      <div className="bcDash-input-focus-line"></div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="bcDash-premium-btn bcDash-offer-btn">
                  <span className="bcDash-btn-text">Post Your Ride</span>
                  <div className="bcDash-btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="bcDash-btn-ripple"></div>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Rest of your sections... */}
      <section className="bcDash-features-section">
        <div className="bcDash-features-container">
          <div className="bcDash-feature-card">
            <div className="bcDash-feature-icon bcDash-search-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="bcDash-feature-title">Find Available Rides</h3>
            <p className="bcDash-feature-description">
              Browse through rides posted by other users. Search by pickup location, destination, and travel date to find the perfect ride that matches your schedule.
            </p>
            <div className="bcDash-feature-benefits">
              <div className="bcDash-benefit-item">✓ Search by location & date</div>
              <div className="bcDash-benefit-item">✓ View driver profiles</div>
              <div className="bcDash-benefit-item">✓ See available seats</div>
              <div className="bcDash-benefit-item">✓ Check price per person</div>
            </div>
            <div className="bcDash-feature-overlay"></div>
          </div>

          <div className="bcDash-feature-card">
            <div className="bcDash-feature-icon bcDash-post-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v6a2 2 0 002 2h4a2 2 0 002-2v-6m-6 0h6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="bcDash-feature-title">Post Your Ride</h3>
            <p className="bcDash-feature-description">
              Share your planned trip with others. Set your route, departure time, available seats, and price per person. Let passengers book seats and split the cost.
            </p>
            <div className="bcDash-feature-benefits">
              <div className="bcDash-benefit-item">✓ Set your own route</div>
              <div className="bcDash-benefit-item">✓ Choose departure time</div>
              <div className="bcDash-benefit-item">✓ Decide seat availability</div>
              <div className="bcDash-benefit-item">✓ Set fair pricing</div>
            </div>
            <div className="bcDash-feature-overlay"></div>
          </div>

          <div className="bcDash-feature-card">
            <div className="bcDash-feature-icon bcDash-book-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="bcDash-feature-title">Book & Connect</h3>
            <p className="bcDash-feature-description">
              Book seats on rides that match your needs. Connect with drivers and fellow passengers. View trip details, meet your travel companions, and enjoy shared journeys.
            </p>
            <div className="bcDash-feature-benefits">
              <div className="bcDash-benefit-item">✓ Book seats instantly</div>
              <div className="bcDash-benefit-item">✓ Connect with travelers</div>
              <div className="bcDash-benefit-item">✓ View trip details</div>
              <div className="bcDash-benefit-item">✓ Share travel costs</div>
            </div>
            <div className="bcDash-feature-overlay"></div>
          </div>
        </div>
      </section>

      <section className="bcDash-stats-section">
        <div className="bcDash-stats-container">
          <div className="bcDash-stat-item">
            <div className="bcDash-stat-icon">🚀</div>
            <div className="bcDash-stat-number">New</div>
            <div className="bcDash-stat-label">Platform</div>
          </div>
          <div className="bcDash-stat-item">
            <div className="bcDash-stat-icon">🌟</div>
            <div className="bcDash-stat-number">Growing</div>
            <div className="bcDash-stat-label">Community</div>
          </div>
          <div className="bcDash-stat-item">
            <div className="bcDash-stat-icon">🔒</div>
            <div className="bcDash-stat-number">Secure</div>
            <div className="bcDash-stat-label">Platform</div>
          </div>
          <div className="bcDash-stat-item">
            <div className="bcDash-stat-icon">💡</div>
            <div className="bcDash-stat-number">Simple</div>
            <div className="bcDash-stat-label">Booking</div>
          </div>
        </div>
      </section>

      <footer className="bcDash-cta-section">
        <div className="bcDash-cta-content">
          <h2 className="bcDash-cta-title">Ready to Start Your Journey?</h2>
          <p className="bcDash-cta-description">
            Join BroCab community and start sharing rides. Post your trips or find rides posted by others. Connect, travel, and save money together.
          </p>
          <div className="bcDash-cta-buttons">
            <button 
              className="bcDash-cta-btn bcDash-cta-primary"
              onClick={() => handleCTAClick('search')}
            >
              <span>Find a Ride</span>
            </button>
            <button 
              className="bcDash-cta-btn bcDash-cta-secondary"
              onClick={() => handleCTAClick('offer')}
            >
              <span>Offer a Ride</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

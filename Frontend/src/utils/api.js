// API utility functions for making authenticated requests
import { auth } from '../firebase/config';

const API_BASE_URL = 'http://localhost:8080';

// Get auth token from Firebase user with better error handling
const getAuthToken = async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe(); // Unsubscribe immediately
      if (user) {
        try {
          const token = await user.getIdToken(true); // Force refresh
          resolve(token);
        } catch (error) {
          console.error('Error getting auth token:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// Generic API call function with automatic token attachment
export const apiCall = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('Adding bearer token to request:', token.substring(0, 20) + '...');
  } else {
    console.warn('No authentication token available for API call');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  console.log('Making API call to:', url, 'with headers:', headers);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response;
};

// Specific API functions for your backend
export const userAPI = {
  // Create user profile
  create: async (userData) => {
    const response = await apiCall('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Get user basic info
  getBasic: async (userID) => {
    const response = await apiCall(`/user/${userID}`);
    return response.json();
  },

  // Get user's posted rides
  getPostedRides: async () => {
    const response = await apiCall('/user/rides/posted');
    return response.json();
  },

  // Get user's joined rides
  getJoinedRides: async () => {
    const response = await apiCall('/user/rides/joined');
    return response.json();
  },

  // Get user privileges
  getPrivileges: async () => {
    const response = await apiCall('/user/privileges');
    return response.json();
  },

  // Get notifications
  getNotifications: async () => {
    const response = await apiCall('/user/notifications');
    return response.json();
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await apiCall('/user/notifications/unread-count');
    return response.json();
  },

  // Cancel ride participation
  cancelRide: async (rideID) => {
    const response = await apiCall(`/user/cancel-ride/${rideID}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const rideAPI = {
  // Create a new ride
  create: async (rideData) => {
    const response = await apiCall('/ride', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
    return response.json();
  },

  // Get ride leader info
  getLeader: async (rideID) => {
    const response = await apiCall(`/ride/${rideID}/leader`);
    return response.json();
  },

  // Filter rides
  filter: async (origin, destination, date) => {
    const params = new URLSearchParams({ origin, destination, date });
    const response = await apiCall(`/ride/filter?${params}`);
    return response.json();
  },

  // Get join requests for a ride (leaders only)
  getRequests: async (rideID) => {
    const response = await apiCall(`/ride/${rideID}/requests`);
    return response.json();
  },

  // Send join request
  sendJoinRequest: async (rideID) => {
    const response = await apiCall(`/ride/${rideID}/join`, {
      method: 'POST',
    });
    return response.json();
  },

  // Join ride with privilege
  joinWithPrivilege: async (rideID) => {
    const response = await apiCall(`/ride/${rideID}/join-ride`, {
      method: 'POST',
    });
    return response.json();
  },

  // Get participants (leaders only)
  getParticipants: async (rideID) => {
    const response = await apiCall(`/ride/${rideID}/participants`);
    return response.json();
  },

  // Remove participant (leaders only)
  removeParticipant: async (rideID, participantID) => {
    const response = await apiCall(`/ride/${rideID}/participant/${participantID}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Approve join request (leaders only)
  approveRequest: async (rideID, requestID) => {
    const response = await apiCall(`/ride/${rideID}/approve/${requestID}`, {
      method: 'POST',
    });
    return response.json();
  },

  // Reject join request (leaders only)
  rejectRequest: async (rideID, requestID) => {
    const response = await apiCall(`/ride/${rideID}/reject/${requestID}`, {
      method: 'POST',
    });
    return response.json();
  },
};

export const notificationAPI = {
  // Mark notification as read
  markAsRead: async (notificationID) => {
    const response = await apiCall(`/notification/${notificationID}/read`, {
      method: 'POST',
    });
    return response.json();
  },
};
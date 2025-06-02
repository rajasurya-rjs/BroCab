// API utility functions for making authenticated requests
import { auth } from '../firebase/config';

const API_BASE_URL = 'https://brocab.onrender.com';

// Test connectivity with backend
export const pingServer = async () => {
  try {
    console.log('Pinging server...');
    const response = await fetch(`${API_BASE_URL}/ping`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Ping response:', data);
    return data;
  } catch (error) {
    console.error('Ping error:', error);
    throw error;
  }
};

// Get auth token from Firebase user with better error handling
const getAuthToken = async () => {
  try {
    // Get current user directly from auth
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken(true); // Force refresh
      console.log('Successfully got auth token:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('No authenticated user found');
      return null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
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

  console.log('Making API call to:', url, 'with method:', options.method || 'GET');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP error! status: ${response.status}` 
      }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
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
    try {
      console.log('Calling privileges endpoint');
      const response = await apiCall('/user/privileges');
      const data = await response.json();
      console.log('Raw privileges response:', data);
      return data;
    } catch (err) {
      console.error('Error in getPrivileges:', err);
      throw err;
    }
  },

  // Get user's sent join requests
  getSentRequests: async () => {
    const response = await apiCall('/user/requests');
    return response.json();
  },

  // Get notifications
  getNotifications: async () => {
    try {
      console.log('userAPI.getNotifications: Starting request...');
      const response = await apiCall('/user/notifications');
      console.log('userAPI.getNotifications: Got response:', response);
      console.log('userAPI.getNotifications: Response status:', response.status);
      
      const data = await response.json();
      console.log('userAPI.getNotifications: Parsed JSON data:', data);
      
      // Ensure we return an array
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.notifications)) {
        return data.notifications;
      } else {
        console.warn('Unexpected notification data format:', data);
        return [];
      }
    } catch (error) {
      console.error('userAPI.getNotifications: Error occurred:', error);
      throw error;
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      console.log('userAPI.getUnreadCount: Starting request...');
      const response = await apiCall('/user/notifications/unread-count');
      const data = await response.json();
      console.log('userAPI.getUnreadCount: Response data:', data);
      
      // Handle different response formats
      if (typeof data === 'number') {
        return { unread_count: data };
      } else if (data && typeof data.unread_count === 'number') {
        return data;
      } else if (data && typeof data.count === 'number') {
        return { unread_count: data.count };
      } else {
        console.warn('Unexpected unread count format:', data);
        return { unread_count: 0 };
      }
    } catch (error) {
      console.error('userAPI.getUnreadCount: Error occurred:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    try {
      console.log('userAPI.markAllNotificationsAsRead: Starting request...');
      const response = await apiCall('/user/notifications/mark-all-read', {
        method: 'PUT',
      });
      const data = await response.json();
      console.log('userAPI.markAllNotificationsAsRead: Response data:', data);
      return data;
    } catch (error) {
      console.error('userAPI.markAllNotificationsAsRead: Error occurred:', error);
      throw error;
    }
  },

  // Mark single notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      console.log('userAPI.markNotificationAsRead: Starting request for ID:', notificationId);
      const response = await apiCall(`/user/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      const data = await response.json();
      console.log('userAPI.markNotificationAsRead: Response data:', data);
      return data;
    } catch (error) {
      console.error('userAPI.markNotificationAsRead: Error occurred:', error);
      throw error;
    }
  },

  // Cancel ride participation (unified - handles both pending requests and participation)
  cancelRide: async (rideID) => {
    const response = await apiCall(`/user/cancel-ride/${rideID}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Clear involvement for a specific date (requests and privileges)
  clearInvolvementForDate: async (date) => {
    const response = await apiCall(`/user/clear-involvement/${date}`, {
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

  // Cancel pending join request
  cancelJoinRequest: async (rideID) => {
    const response = await apiCall(`/ride/${rideID}/cancel-request`, {
      method: 'DELETE',
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

// Updated notification API with proper endpoints
export const notificationAPI = {
  // Mark notification as read (legacy support)
  markAsRead: async (notificationID) => {
    try {
      console.log('notificationAPI.markAsRead: Starting request for ID:', notificationID);
      const response = await apiCall(`/notification/${notificationID}/read`, {
        method: 'POST',
      });
      const data = await response.json();
      console.log('notificationAPI.markAsRead: Response data:', data);
      return data;
    } catch (error) {
      console.error('notificationAPI.markAsRead: Error occurred:', error);
      throw error;
    }
  },

  // Get all notifications (alternative endpoint)
  getAll: async () => {
    try {
      console.log('notificationAPI.getAll: Starting request...');
      const response = await apiCall('/notifications');
      const data = await response.json();
      console.log('notificationAPI.getAll: Response data:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('notificationAPI.getAll: Error occurred:', error);
      throw error;
    }
  },

  // Get unread count (alternative endpoint)
  getUnreadCount: async () => {
    try {
      console.log('notificationAPI.getUnreadCount: Starting request...');
      const response = await apiCall('/notifications/unread-count');
      const data = await response.json();
      console.log('notificationAPI.getUnreadCount: Response data:', data);
      return data;
    } catch (error) {
      console.error('notificationAPI.getUnreadCount: Error occurred:', error);
      throw error;
    }
  },

  // Mark all as read (alternative endpoint)
  markAllAsRead: async () => {
    try {
      console.log('notificationAPI.markAllAsRead: Starting request...');
      const response = await apiCall('/notifications/mark-all-read', {
        method: 'PUT',
      });
      const data = await response.json();
      console.log('notificationAPI.markAllAsRead: Response data:', data);
      return data;
    } catch (error) {
      console.error('notificationAPI.markAllAsRead: Error occurred:', error);
      throw error;
    }
  },
};

// Utility function to handle API errors consistently
export const handleAPIError = (error, context = '') => {
  console.error(`API Error ${context}:`, error);
  
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
    return 'Authentication required. Please log in again.';
  } else if (error.message.includes('403')) {
    return 'Access denied. You do not have permission for this action.';
  } else if (error.message.includes('404')) {
    return 'Resource not found.';
  } else if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (error.message.includes('Network')) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

// Export default object for easier importing
export default {
  userAPI,
  rideAPI,
  notificationAPI,
  pingServer,
  apiCall,
  handleAPIError,
};

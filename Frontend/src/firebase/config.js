// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcanAdO4OKjS1pxn-SsyZ9pEE6AvkX6tc",
  authDomain: "brocab-1c545.firebaseapp.com",
  projectId: "brocab-1c545",
  storageBucket: "brocab-1c545.firebasestorage.app",
  messagingSenderId: "356073188733",
  appId: "1:356073188733:web:bb28d65ad93102eedd3014",
  measurementId: "G-TYGDGMPTYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
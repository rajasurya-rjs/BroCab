import React, { useState, useEffect } from 'react';
import { pingServer } from '../../utils/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      setStatus('loading');
      setError(null);
      
      const response = await pingServer();
      
      if (response && response.message === 'pong') {
        setStatus('success');
        setMessage('Connection successful! Backend is responding.');
      } else {
        setStatus('error');
        setError('Unexpected response from server');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Error connecting to backend');
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{
      padding: '20px',
      borderRadius: '8px',
      background: '#f8f9fa',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      margin: '20px 0',
      textAlign: 'center'
    }}>
      <h3>Backend Connection Status</h3>
      
      {status === 'loading' && (
        <div style={{ color: '#6c757d' }}>
          Testing connection to backend...
        </div>
      )}
      
      {status === 'success' && (
        <div style={{ color: '#28a745' }}>
          <span role="img" aria-label="success">✅</span> {message}
        </div>
      )}
      
      {status === 'error' && (
        <div style={{ color: '#dc3545' }}>
          <span role="img" aria-label="error">❌</span> Connection failed: {error}
        </div>
      )}
      
      <button
        onClick={testConnection}
        style={{
          marginTop: '15px',
          padding: '8px 16px',
          background: '#6B25E4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {status === 'loading' ? 'Testing...' : 'Test Connection'}
      </button>
    </div>
  );
};

export default ConnectionTest;
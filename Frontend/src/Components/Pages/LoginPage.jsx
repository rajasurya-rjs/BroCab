import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// CSS Styles as a separate object
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  mainCard: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '900px',
    display: 'flex',
    minHeight: '500px',
    flexDirection: 'row',
  },
  leftPanel: {
    flex: '1',
    padding: '40px 35px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '35px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoDot: {
    width: '8px',
    height: '8px',
    background: '#667eea',
    borderRadius: '50%',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  createAccountLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  titleSection: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    color: '#666',
    fontSize: '15px',
    margin: '0',
  },
  googleButton: {
    width: '100%',
    padding: '14px',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a1a',
    cursor: 'pointer',
    marginBottom: '25px',
    transition: 'all 0.2s ease',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '25px',
  },
  dividerLine: {
    flex: '1',
    height: '1px',
    background: '#e5e5e5',
  },
  dividerText: {
    padding: '0 15px',
    color: '#999',
    fontSize: '13px',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'flex',
    alignSelf: "end",
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  forgotPassword: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  forgotPasswordLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  rightPanel: {
    flex: '1',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  rightPanelContent: {
    width: '100%',
    height: '100%',
    background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="%23f0f0f0"/><circle cx="200" cy="200" r="80" fill="%23667eea" opacity="0.3"/><rect x="150" y="300" width="100" height="60" rx="10" fill="%23764ba2" opacity="0.2"/><circle cx="120" cy="450" r="40" fill="%23667eea" opacity="0.2"/><circle cx="280" cy="380" r="30" fill="%23764ba2" opacity="0.3"/></svg>') center/cover`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    padding: '35px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '50%',
    margin: '0 auto 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    color: '#1a1a1a',
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 10px 0',
  },
  featureText: {
    color: '#666',
    fontSize: '15px',
    margin: '0',
    lineHeight: '1.5',
  },
};

// Icons
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const CarIcon = () => (
  <svg width="35" height="35" fill="white" viewBox="0 0 24 24">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);

// Login Form Component
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    alert(`Logging in with\nEmail: ${email}\nPassword: ${password}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div style={styles.forgotPassword}>
        <a href="#" style={styles.forgotPasswordLink}>Forgot your password?</a>
      </div>
      <button type="submit" style={styles.loginButton}>Log in</button>
    </form>
  );
};

// Page Component
const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        <div style={styles.leftPanel}>
          <div style={styles.header}>
            <div style={styles.logo}>
              <div style={styles.logoDot}></div>
              <span style={styles.logoText}>Brocab</span>
            </div>
            <a href="#" style={styles.createAccountLink} onClick={e => { e.preventDefault(); navigate('/signup'); }}>Create an account</a>
          </div>
          <div style={styles.titleSection}>
            <h2 style={styles.title}>Welcome back</h2>
            <p style={styles.subtitle}>Log in to your account to continue</p>
          </div>
          <button style={styles.googleButton}>
            <GoogleIcon />
            Continue with Google
          </button>
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <div style={styles.dividerText}>or</div>
            <div style={styles.dividerLine}></div>
          </div>
          <LoginForm />
        </div>
        <div style={styles.rightPanel}>
          <div style={styles.rightPanelContent}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <CarIcon />
              </div>
              <h3 style={styles.featureTitle}>Reliable Rides</h3>
              <p style={styles.featureText}>
                Travel together with trusted students heading to the same destination. Save time, money, and the environment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
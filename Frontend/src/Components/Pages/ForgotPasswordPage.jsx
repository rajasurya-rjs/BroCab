import React, { useState } from 'react';
// Reuse and adapt styles from your login page
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
    minHeight: '420px',
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
  loginLink: {
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
    background: '#faf9ff',
  },
  inputFocused: {
    borderColor: '#667eea',
    background: '#fff',
    boxShadow: '0 0 0 2px #e6e6fa',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: '12px',
    marginTop: '3px',
    marginLeft: '2px',
  },
  successText: {
    color: '#38a169',
    fontSize: '13px',
    marginTop: '8px',
    marginBottom: '8px',
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.1s',
    marginTop: '8px',
  },
  submitButtonHover: {
    background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)',
    transform: 'translateY(-2px) scale(1.03)',
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

const LockIcon = () => (
  <svg width="35" height="35" fill="white" viewBox="0 0 24 24">
    <rect x="6" y="10" width="12" height="8" rx="3" fill="#fff" />
    <rect x="9" y="13" width="6" height="6" rx="3" fill="#a78bfa" />
    <rect x="7" y="6" width="10" height="6" rx="3" fill="#a78bfa" />
  </svg>
);

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setSent(false);
    } else {
      setError('');
      setSent(true);
      // Here you would trigger your API call
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor="email">Email</label>
        <input
          style={{
            ...styles.input,
            ...(focused ? styles.inputFocused : {}),
            borderColor: error ? '#e53e3e' : (focused ? '#667eea' : '#e5e5e5'),
          }}
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); setSent(false); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="you@example.com"
          aria-invalid={!!error}
          aria-describedby="forgot-error"
        />
        {error && <div style={styles.errorText} id="forgot-error">{error}</div>}
      </div>
      {sent && (
        <div style={styles.successText}>
          If an account exists for this email, a reset link has been sent.
        </div>
      )}
      <button
        type="submit"
        style={{
          ...styles.submitButton,
          ...(btnHover ? styles.submitButtonHover : {}),
        }}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        aria-label="Send Reset Link"
      >
        Send Reset Link
      </button>
    </form>
  );
};

const ForgotPasswordPage = () => (
  <div style={styles.container}>
    <div style={styles.mainCard}>
      <div style={styles.leftPanel}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoDot}></div>
            <span style={styles.logoText}>Brocab</span>
          </div>
          <a href="#" style={styles.loginLink}>Log in</a>
        </div>
        <div style={styles.titleSection}>
          <h2 style={styles.title}>Forgot your password?</h2>
          <p style={styles.subtitle}>Enter your email and we'll send you a reset link.</p>
        </div>
        <ForgotPasswordForm />
      </div>
      <div style={styles.rightPanel}>
        <div style={styles.rightPanelContent}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <LockIcon />
            </div>
            <h3 style={styles.featureTitle}>Reset Securely</h3>
            <p style={styles.featureText}>
              We'll send you a secure link to reset your password and get you back on the road.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ForgotPasswordPage;

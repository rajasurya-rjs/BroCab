import React, { useState } from "react";

// Glassmorphic card and input styles matching your main page
const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    position: "relative",
    background: "linear-gradient(135deg, #e2e4fa 0%, #c7f4f7 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 1,
  },
  backgroundSVG: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 0,
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(8px)",
    borderRadius: "22px",
    boxShadow: "0 8px 32px rgba(99,102,241,0.09)",
    padding: "38px 32px 32px 32px",
    minWidth: "320px",
    maxWidth: "380px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "bcDash-fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#1e293b",
    marginBottom: "8px",
    textAlign: "center",
    letterSpacing: "-1px",
    textShadow: "0 2px 4px rgba(0,0,0,0.08)",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#475569",
    marginBottom: "26px",
    textAlign: "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: "18px",
    position: "relative",
  },
  label: {
    fontWeight: 600,
    fontSize: "14px",
    color: "#1e293b",
    marginBottom: "7px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "16px 20px",
    border: "none",
    borderRadius: "18px",
    fontSize: "16px",
    fontWeight: 500,
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(6px)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    outline: "none",
    border: "2px solid transparent",
    color: "#1e293b",
    transition: "background 0.3s, box-shadow 0.3s, border-color 0.3s, transform 0.3s",
  },
  inputFocused: {
    background: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    transform: "translateY(-2px)",
    borderColor: "#6366f1",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: "13px",
    marginTop: "3px",
    marginLeft: "2px",
  },
  successText: {
    color: "#10b981",
    fontSize: "14px",
    marginTop: "10px",
    marginBottom: "10px",
    textAlign: "center",
    fontWeight: 600,
  },
  submitButton: {
    width: "100%",
    padding: "16px 0",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "white",
    border: "none",
    borderRadius: "18px",
    fontSize: "17px",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: "8px",
    marginBottom: "10px",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.22)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "background 0.3s, box-shadow 0.3s, transform 0.3s",
  },
  submitButtonHover: {
    background: "linear-gradient(135deg, #5856eb 0%, #7c3aed 100%)",
    transform: "translateY(-3px)",
    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.33)",
  },
  loginLink: {
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "15px",
    marginTop: "12px",
    display: "block",
    textAlign: "center",
    transition: "color 0.2s",
  },
  loginLinkHover: {
    color: "#7c3aed",
  },
};

const BgSVG = () => (
  <svg style={styles.backgroundSVG} viewBox="0 0 1440 900" preserveAspectRatio="none">
    <defs>
      <linearGradient id="bg-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e2e4fa" />
        <stop offset="100%" stopColor="#c7f4f7" />
      </linearGradient>
    </defs>
    <rect width="1440" height="900" fill="url(#bg-gradient)" />
    {/* Soft circle accents */}
    <circle cx="220" cy="700" r="330" fill="#c7f4f7" opacity="0.45" />
    <circle cx="1300" cy="120" r="210" fill="#d1ccfc" opacity="0.28" />
    {/* Wavy white bottom */}
    <path
      d="M0,700 Q360,800 720,750 T1440,800 V900 H0 Z"
      fill="#fff"
      opacity="0.98"
    />
    {/* Dashed path */}
    <path
      d="M230,470 Q600,400 1200,650"
      stroke="#6f42c1"
      strokeWidth="13"
      fill="none"
      strokeDasharray="40 30"
      strokeLinecap="round"
    />
    {/* Start pin */}
    <g>
      <circle cx="230" cy="470" r="12" fill="#6f42c1" />
      <path d="M230 430 L255 480 L205 480 Z" fill="#6f42c1" />
      <circle cx="230" cy="455" r="13" fill="#fff" />
      <circle cx="230" cy="455" r="7" fill="#d1ccfc" />
    </g>
    {/* End pin */}
    <g>
      <circle cx="1200" cy="650" r="12" fill="#6f42c1" />
      <path d="M1200 610 L1225 660 L1175 660 Z" fill="#6f42c1" />
      <circle cx="1200" cy="635" r="13" fill="#fff" />
      <circle cx="1200" cy="635" r="7" fill="#d1ccfc" />
    </g>
  </svg>
);

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [loginHover, setLoginHover] = useState(false);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setSent(false);
    } else {
      setError("");
      setSent(true);
      // Here you would trigger your API call
    }
  };

  return (
    <div style={styles.container}>
      <BgSVG />
      <form style={styles.card} onSubmit={handleSubmit} autoComplete="off">
        <div style={styles.title}>Forgot Password?</div>
        <div style={styles.subtitle}>
          Enter your email and we'll send you a reset link.
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label} htmlFor="email">Email</label>
          <input
            style={{
              ...styles.input,
              ...(focused ? styles.inputFocused : {}),
              borderColor: error ? "#e53e3e" : (focused ? "#6366f1" : "transparent"),
            }}
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); setSent(false); }}
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
        >
          Send Reset Link
        </button>
        <a
          href="/login"
          style={{
            ...styles.loginLink,
            ...(loginHover ? styles.loginLinkHover : {}),
          }}
          onMouseEnter={() => setLoginHover(true)}
          onMouseLeave={() => setLoginHover(false)}
        >
          Back to Login
        </a>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;

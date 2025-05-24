import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

// --- SVG Background Component ---
const BrocabHeroBackground = () => (
  <svg
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 0,
      pointerEvents: "none",
      minHeight: "100vh",
      minWidth: "100vw",
    }}
    viewBox="0 0 1440 900"
    preserveAspectRatio="none"
  >
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
      <circle cx="230" cy="470" r="28" fill="#6f42c1" />
      <circle cx="230" cy="470" r="14" fill="#fff" />
    </g>
    {/* End pin */}
    <g>
      <circle cx="1200" cy="650" r="28" fill="#6f42c1" />
      <circle cx="1200" cy="650" r="14" fill="#fff" />
    </g>
  </svg>
);

// --- Your Existing Styles (unchanged except background removed from container) ---
const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
  },
  // ... (rest of your styles as in your code)
  mainCard: {
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.18)",
    overflow: "hidden",
    width: "100%",
    maxWidth: "800px",
    display: "flex",
    minHeight: "420px",
    flexDirection: "row",
    zIndex: 1,
  },
  leftPanel: {
    flex: "1",
    padding: "36px 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "white",
    minWidth: "320px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "26px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logoDot: {
    width: "9px",
    height: "9px",
    background: "#667eea",
    borderRadius: "50%",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  loginLink: {
    color: "#667eea",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "8px",
    padding: "4px 12px",
    transition: "background 0.2s",
  },
  loginLinkHover: {
    background: "#ede9fe",
  },
  titleSection: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 4px 0",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    margin: "0",
  },
  inputGroup: {
    marginBottom: "13px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  input: (isError) => ({
    width: "100%",
    padding: "12px",
    border: `2px solid ${isError ? "#e53e3e" : "#e5e5e5"}`,
    borderRadius: "12px",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    background: "#faf9ff",
  }),
  inputFocused: {
    borderColor: "#7c6ee6",
    boxShadow: "0 0 0 2px #e6e6fa",
    background: "#fff",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: "12px",
    marginTop: "3px",
    marginLeft: "2px",
  },
  signupButton: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.1s",
    marginTop: "10px",
    boxShadow: "0 2px 8px 0 rgba(124, 58, 237, 0.08)",
  },
  signupButtonHover: {
    background: "linear-gradient(90deg, #764ba2 0%, #667eea 100%)",
    transform: "translateY(-2px) scale(1.03)",
  },
  rightPanel: {
    flex: "1",
    background:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    minWidth: "260px",
  },
  rightPanelContent: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureCard: {
    background: "rgba(255, 255, 255, 0.92)",
    borderRadius: "16px",
    padding: "26px 20px 18px 20px",
    textAlign: "center",
    boxShadow: "0 4px 16px 0 rgba(124, 58, 237, 0.08)",
    minWidth: "210px",
    maxWidth: "320px",
    margin: "0 auto",
  },
  featureIcon: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #a78bfa 0%, #7c6ee6 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  featureTitle: {
    color: "#22223b",
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "7px",
    textAlign: "center",
  },
  featureText: {
    color: "#6b7280",
    fontSize: "13px",
    textAlign: "center",
    lineHeight: "1.5",
  },
};

const UserIcon = () => (
  <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" fill="#fff" />
    <rect x="4" y="16" width="16" height="6" rx="3" fill="#fff" />
  </svg>
);

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.match(/^\S+@\S+\.\S+$/)) errors.email = "Valid email required";
  if (!form.password || form.password.length < 6)
    errors.password = "Min 6 characters";
  if (!form.phone.match(/^[6-9]\d{9}$/))
    errors.phone = "Valid 10-digit Indian number";
  if (!form.gender) errors.gender = "Select gender";
  return errors;
};

const SignUpForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
  });
  const [focused, setFocused] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [btnHover, setBtnHover] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  const genderRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };
  const handleBlur = (e) => {
    setFocused("");
    setTouched({ ...touched, [e.target.name]: true });
    const field = e.target.name;
    const fieldError = validate({ ...form, [field]: form[field] });
    setErrors({ ...errors, [field]: fieldError[field] });
  };

  const handleFocus = (field) => setFocused(field);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched({
      name: true,
      email: true,
      password: true,
      phone: true,
      gender: true,
    });
    if (Object.keys(errs).length === 0) {
      alert(
        `Name: ${form.name}\nEmail: ${form.email}\nPassword: ${form.password}\nPhone: ${form.phone}\nGender: ${form.gender}`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <div style={styles.inputGroup}>
        <input
          ref={nameRef}
          style={{
            ...styles.input(errors.name),
            ...(focused === "name" ? styles.inputFocused : {}),
          }}
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          onFocus={() => handleFocus("name")}
          onBlur={handleBlur}
          placeholder="Your name"
          aria-invalid={!!errors.name}
          aria-describedby="name-error"
          autoComplete="off"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              emailRef.current && emailRef.current.focus();
            }
          }}
        />
        {touched.name && errors.name && (
          <div style={styles.errorText} id="name-error">
            {errors.name}
          </div>
        )}
      </div>
      <div style={styles.inputGroup}>
        <input
          ref={emailRef}
          style={{
            ...styles.input(errors.email),
            ...(focused === "email" ? styles.inputFocused : {}),
          }}
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onFocus={() => handleFocus("email")}
          onBlur={handleBlur}
          placeholder="Email address"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
          autoComplete="off"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              passwordRef.current && passwordRef.current.focus();
            }
          }}
        />
        {touched.email && errors.email && (
          <div style={styles.errorText} id="email-error">
            {errors.email}
          </div>
        )}
      </div>
      <div style={styles.inputGroup}>
        <input
          ref={passwordRef}
          style={{
            ...styles.input(errors.password),
            ...(focused === "password" ? styles.inputFocused : {}),
          }}
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onFocus={() => handleFocus("password")}
          onBlur={handleBlur}
          placeholder="Password"
          minLength={6}
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
          autoComplete="new-password"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              phoneRef.current && phoneRef.current.focus();
            }
          }}
        />
        {touched.password && errors.password && (
          <div style={styles.errorText} id="password-error">
            {errors.password}
          </div>
        )}
      </div>
      <div style={styles.inputGroup}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              background: "#ede9fe",
              color: "#667eea",
              fontWeight: 600,
              padding: "0 11px",
              borderRadius: "6px 0 0 6px",
              border: `2px solid ${errors.phone ? "#e53e3e" : "#e5e5e5"}`,
              borderRight: "none",
              height: "40px",
              display: "flex",
              alignItems: "center",
              fontSize: "15px",
              minWidth: "48px",
              justifyContent: "center",
            }}
          >
            +91
          </span>
          <input
            ref={phoneRef}
            style={{
              ...styles.input(errors.phone),
              borderRadius: "0 12px 12px 0",
              borderLeft: "none",
              flex: 1,
              ...(focused === "phone" ? styles.inputFocused : {}),
            }}
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            onFocus={() => handleFocus("phone")}
            onBlur={handleBlur}
            required
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            placeholder="Phone number (10 digits)"
            title="Enter a valid 10-digit Indian mobile number"
            aria-invalid={!!errors.phone}
            aria-describedby="phone-error"
            autoComplete="off"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                genderRef.current && genderRef.current.focus();
              }
            }}
          />
        </div>
        {touched.phone && errors.phone && (
          <div style={styles.errorText} id="phone-error">
            {errors.phone}
          </div>
        )}
      </div>
      <div style={styles.inputGroup}>
        <select
          ref={genderRef}
          style={{
            ...styles.input(errors.gender),
            ...(focused === "gender" ? styles.inputFocused : {}),
          }}
          id="gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          onFocus={() => handleFocus("gender")}
          onBlur={handleBlur}
          aria-invalid={!!errors.gender}
          aria-describedby="gender-error"
          required
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {touched.gender && errors.gender && (
          <div style={styles.errorText} id="gender-error">
            {errors.gender}
          </div>
        )}
      </div>
      <button
        type="submit"
        style={{
          ...styles.signupButton,
          ...(btnHover ? styles.signupButtonHover : {}),
        }}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        aria-label="Sign Up"
      >
        Sign Up
      </button>
      <button
        type="button"
        style={{
          ...styles.signupButton,
          background: '#e5e5e5',
          color: '#333',
          marginTop: 8,
        }}
        onClick={() => window.location.assign('/')} // Go back to dashboard
        aria-label="Back to Dashboard"
      >
        Back
      </button>
    </form>
  );
};

const SignUpPage = () => {
  const navigate = useNavigate();
  // Animation state for slide-up
  const [slideIn, setSlideIn] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => setSlideIn(true), 10);
  }, []);

  return (
    <div style={styles.container}>
      <BrocabHeroBackground />
      <div
        style={{
          ...styles.mainCard,
          transform: slideIn ? 'translateY(0)' : 'translateY(60px)',
          opacity: slideIn ? 1 : 0,
          transition: 'transform 0.5s cubic-bezier(.4,1.4,.6,1), opacity 0.5s',
        }}
      >
        <div style={styles.leftPanel}>
          <div style={styles.header}>
            <div style={styles.logo}>
              <div style={styles.logoDot}></div>
              <span style={styles.logoText}>Brocab</span>
            </div>
            <a
              href="#"
              style={styles.loginLink}
              onClick={e => {
                e.preventDefault();
                window.location.assign('/login');
              }}
              onMouseOver={e => (e.currentTarget.style.background = "#ede9fe")}
              onMouseOut={e => (e.currentTarget.style.background = "transparent")}
            >
              Log in
            </a>
          </div>
          <div style={styles.titleSection}>
            <h2 style={styles.title}>Create your account</h2>
            <p style={styles.subtitle}>Sign up to start sharing rides</p>
          </div>
          <SignUpForm />
          {/* Back button at the bottom */}
          
        </div>
        <div style={styles.rightPanel}>
          <div style={styles.rightPanelContent}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <UserIcon />
              </div>
              <h3 style={styles.featureTitle}>Join the Community</h3>
              <p style={styles.featureText}>
                Connect with fellow students, share costs, reduce your carbon footprint, and make new friends on your journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
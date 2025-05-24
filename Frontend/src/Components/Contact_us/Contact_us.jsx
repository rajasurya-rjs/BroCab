import React, { useState } from 'react';
import './Contact_us.css';
import Navbar from '../Navbar/Navbar';

const BACKGROUND_IMAGE = '/backgroundimg.png';

const Contact_us = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    issueType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with your actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        issueType: 'general'
      });
      
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bcContact-container" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}>
      <Navbar />
      
      <div className="bcContact-main-content">
        {/* Header Section */}
        <div className="bcContact-header">
          <h1 className="bcContact-title">Need Help? We Got You, Bro!</h1>
          <p className="bcContact-subtitle">
            Hit us up anytime - we're here to make your ride smooth! 🚗💜
          </p>
        </div>

        <div className="bcContact-content-wrapper">
          {/* Contact Form */}
          <div className="bcContact-form-section">
            <div className="bcContact-form-container">
              <h2 className="bcContact-form-title">Drop us a message</h2>
              
              {submitStatus === 'success' && (
                <div className="bcContact-success-message">
                  <span className="bcContact-success-icon">✅</span>
                  <p>Yooo! Your message was sent successfully! We'll get back to you ASAP! 🚀</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bcContact-error-message">
                  <span className="bcContact-error-icon">❌</span>
                  <p>Oops! Something went wrong. Please try again, bestie! 😅</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="bcContact-form">
                <div className="bcContact-form-row">
                  <div className="bcContact-input-group">
                    <label className="bcContact-label">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="What should we call you?"
                      className="bcContact-input"
                      required
                    />
                  </div>

                  <div className="bcContact-input-group">
                    <label className="bcContact-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="bcContact-input"
                      required
                    />
                  </div>
                </div>

                <div className="bcContact-form-row">
                  <div className="bcContact-input-group">
                    <label className="bcContact-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="bcContact-input"
                    />
                  </div>

                  <div className="bcContact-input-group">
                    <label className="bcContact-label">Issue Type</label>
                    <select
                      name="issueType"
                      value={formData.issueType}
                      onChange={handleInputChange}
                      className="bcContact-select"
                    >
                      <option value="general">General Question</option>
                      <option value="booking">Booking Problem</option>
                      <option value="payment">Payment Issue</option>
                      <option value="technical">Technical Bug</option>
                      <option value="safety">Safety Concern</option>
                      <option value="driver">Become a Driver</option>
                      <option value="partnership">Partnership Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="bcContact-input-group">
                  <label className="bcContact-label">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What's this about?"
                    className="bcContact-input"
                    required
                  />
                </div>

                <div className="bcContact-input-group">
                  <label className="bcContact-label">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us what's on your mind... Don't be shy! 😊"
                    className="bcContact-textarea"
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="bcContact-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="bcContact-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Message 🚀'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bcContact-info-section">
            <div className="bcContact-info-container">
              <h3 className="bcContact-info-title">Other ways to reach us</h3>
              
              <div className="bcContact-info-cards">
                <div className="bcContact-info-card">
                  <div className="bcContact-info-icon">📧</div>
                  <h4>Email Us</h4>
                  <p>ansingh0305@gmail.com</p>
                  <span className="bcContact-info-note">We reply within 24 hours!</span>
                </div>

                <div className="bcContact-info-card">
                  <div className="bcContact-info-icon">📱</div>
                  <h4>Call Us</h4>
                  <p>+91 8610536041</p>
                  <span className="bcContact-info-note">Available 9AM-9PM IST</span>
                </div>
                <div className="bcContact-info-card">
                  <div className="bcContact-info-icon">📍</div>
                  <h4>Visit Us</h4>
                  <p>47/11, Velankani Drive<br />
                     opposite Velankani Tech Park<br />
                     Electronics City Phase 1<br />
                     Bengaluru, Karnataka 560100</p>
                  <span className="bcContact-info-note">By appointment only</span>
                </div>
              </div>

             
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bcContact-faq-section">
          <h3 className="bcContact-faq-title">Frequently Asked Questions</h3>
          <div className="bcContact-faq-grid">
            <div className="bcContact-faq-item">
              <h4>How do I book a ride with BroCab?</h4>
              <p>Super easy! Just search for your route, pick a ride, and hit that request button! 🎯</p>
            </div>
            <div className="bcContact-faq-item">
              <h4>Can I cancel my booking?</h4>
              <p>Yep! You can cancel up to 10 hours before departure. No stress! ✌️</p>
            </div>
            <div className="bcContact-faq-item">
              <h4>What payment methods do you accept?</h4>
              <p>As of now you can pay what is shown in BroCab to the leader of the cab💳</p>
            </div>
            <div className="bcContact-faq-item">
              <h4>How do I become a ride leader?</h4>
              <p>Hit us up through the form above or click the offer ride! We'll get you started! 🚗</p>
            </div>
            <div className="bcContact-faq-item">
              <h4>What if my ride is late?</h4>
              <p>We'll keep you updated! Plus, you can track your ride in real-time! 📱</p>
            </div>
            <div className="bcContact-faq-item">
              <h4>Is BroCab safe?</h4>
              <p>Absolutely! All our drivers are verified and we have 24/7 support! 🛡️</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact_us;

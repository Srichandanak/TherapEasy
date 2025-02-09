import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-container">
      <h1 className="about-header">About TherapEasy</h1>

      {/* Hero Image */}
      <img
        src="image.jpg"
        alt="Healthcare"
        className="hero-image"
      />

      <div className="about-content">
        <p className="about-text">
          TherapEasy is a platform designed to simplify therapy sessions for both patients and therapists.
          Our goal is to make mental health support <strong>accessible, efficient, and secure</strong>.
        </p>

        <div className="about-section">
          <h2 className="section-title">Our Mission</h2>
          <p className="about-text">
            We aim to provide a <strong>seamless experience</strong> for individuals seeking therapy
            and professionals managing patient care through a <strong>secure and user-friendly</strong> platform.
          </p>
        </div>

        <div className="about-section">
          <h2 className="section-title">Why Choose Us?</h2>
          <ul className="about-list">
            <li>✔ Easy booking for virtual & in-person sessions</li>
            <li>✔ Secure storage for medical records</li>
            <li>✔ Personalized therapy insights</li>
            <li>✔ Real-time therapist collaboration</li>
            <li>✔ 24/7 patient support</li>
          </ul>
        </div>

        <div className="contact-info">
          <h2 className="section-title">Contact Us</h2>
          <p>Email: <span>support@therapeasy.com</span></p>
          <p>Phone: <span>+1 (234) 567-890</span></p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

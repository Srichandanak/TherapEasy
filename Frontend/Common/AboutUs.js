import React from "react";
import "./AboutUs.css";
import Navbar from "./Navbar";

const AboutUs = () => {
  return (
    <>
    <Navbar />
    <header>
    <h1 className="logo">TherapEasy</h1>
    </header>
    <div className="about-container">
      <h1 className="about-header">About TherapEasy</h1>

      {/* Hero Image */}
      <img
        src="https://www.google.com/imgres?q=speech%20therapy%20sessions&imgurl=https%3A%2F%2Fwww.nurturers.in%2Fblog%2Fwp-content%2Fuploads%2F2024%2F05%2FKids-Speech-Therapy-center.jpg&imgrefurl=https%3A%2F%2Fwww.nurturers.in%2Fblog%2Fimportance-of-speech-therapy-for-language-development%2F&docid=E-2lIMwzJxpc5M&tbnid=jAG2Qen5qP56RM&vet=12ahUKEwiy-qKk0sOLAxUW0jQHHSIZAJQQM3oECFIQAA..i&w=2560&h=1707&hcb=2&ved=2ahUKEwiy-qKk0sOLAxUW0jQHHSIZAJQQM3oECFIQAA"
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
    </>
  );
};

export default AboutUs;

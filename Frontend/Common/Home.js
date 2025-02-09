import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Header */}
      <h1 className="home-title">TherapEasy</h1>

      {/* Navigation Bar */}
      <div className="navbar">
        <button className="nav-button" onClick={() => navigate("/aboutus")}>
          About Us
        </button>
        <button className="nav-button" onClick={() => navigate("/register")}>
          Register
        </button>
        <button className="nav-button" onClick={() => navigate("/login")}>
          Login
        </button>
        <button className="nav-button" onClick={() => navigate("/contact")}>
          Contact Us
        </button>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Our Features</h2>

        {/* Features for Patients */}
        <h3>For Patients:</h3>
        <ul className="features-list">
          <li>Book virtual or in-person consultations</li>
          <li>Securely store and access medical records</li>
          <li>Get personalized health insights</li>
        </ul>

        {/* Features for Therapists */}
        <h3>For Therapists & Supervisors:</h3>
        <ul className="features-list">
          <li>Manage patient schedules effortlessly</li>
          <li>Monitor health progress in real-time</li>
          <li>Collaborate with experts in the field</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;

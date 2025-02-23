import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");

  // Apply dark mode class on mount
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode ? "enabled" : "disabled");
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <nav className="navbar">
          <button className="nav-button" onClick={() => navigate("/aboutus")}>About Us</button>
          <button className="nav-button" onClick={() => navigate("/register")}>Register</button>
          <button className="nav-button" onClick={() => navigate("/login")}>Login</button>
          <button className="nav-button" onClick={() => navigate("/contact")}>Contact Us</button>
          <button className="nav-button" onClick={toggleDarkMode}>
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </nav>
        <h1 className="logo">TherapEasy</h1>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2> Our Features</h2>

        <div className="feature-group">
          <h3>For Patients</h3>
          <ul>
            <li>Book virtual or in-person consultations</li>
            <li>Securely store and access medical records</li>
            <li>Get personalized health insights</li>
          </ul>
        </div>

        <div className="feature-group">
          <h3>For Therapists & Supervisors</h3>
          <ul>
            <li>Manage patient schedules effortlessly</li>
            <li>Monitor health progress in real-time</li>
            <li>Collaborate with experts in the field</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Home;

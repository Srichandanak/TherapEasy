import React, { useState } from "react";
import "./pDashboard.css";

const UserDashboard = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <h2>WELCOME BACK, USER_NAME</h2>
      </header>

      {/* Navigation Section */}
      <nav className="dashboard-nav">
        <button>NOTIFICATIONS</button>
        <button>MY GOALS</button>
        <button>EDIT PROFILE</button>
        <button>LOGOUT</button>
      </nav>

      {/* Services Offered */}
      <section className="services">
        <h3>SERVICES OFFERED</h3>
        <div className="service-cards">
          <div className="service">
            <img src="therapy.jpg" alt="Therapy" />
            <p>THERAPY</p>
          </div>
          <div className="service">
            <img src="mental_wellness.jpg" alt="Mental Wellness" />
            <p>5 Pillars of Mental Wellness</p>
          </div>
          <div className="service">
            <img src="meditation.jpg" alt="Meditation" />
            <p>Meditation 101</p>
          </div>
        </div>
      </section>

      {/* Current Plans Section */}
      <section className="current-plans">
        <h3>CURRENT PLANS</h3>
        <div className="plans-container">
          <div className="plan">
            <p><strong>Plan Name:</strong> Anxiety Therapy</p>
            <p><strong>Therapist:</strong> Dr. Smith</p>
            <p><strong>Duration:</strong> 4 Weeks</p>
          </div>
          <div className="plan">Week 1 Activities <span className="done">DONE</span></div>
          <div className="plan">Week 2 Activities <span className="done">DONE</span></div>
          <div className="plan">Week 3 Activities <span className="done">DONE</span></div>
          <div className="plan">Week 4 Activities <span className="done">DONE</span></div>
        </div>
      </section>

      {/* Appointment Request */}
      <section className="appointment">
        <h3>REQUEST APPOINTMENT</h3>
        <div className="appointment-form">
          <input type="date" placeholder="Date" />
          <input type="time" placeholder="Time" />
          <input type="text" placeholder="Reason" />
          <button>Submit</button>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="feedback">
        <h3>FEEDBACK</h3>
        <textarea
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button>Send</button>
      </section>
    </div>
  );
};

export default UserDashboard;

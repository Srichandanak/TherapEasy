import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // Assuming you have a separate CSS file for styling

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button className="nav-button-logo" >
        THERAPEASY
      </button>
      <button className="nav-button" onClick={() => navigate("/")}>
        Home
      </button>
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
      
      <button className="nav-button" onClick={() => navigate("/")}>
        LOGOUT
      </button>
    </div>
  );
};

export default Navbar;

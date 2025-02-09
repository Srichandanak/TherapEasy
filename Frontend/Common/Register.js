import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Register.css'
const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    medicalHistory: "",
    role: "patient",
  });

  const [errors, setErrors] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrors("Passwords do not match!");
      return;
    }
    setErrors("");
    onRegister(formData, navigate); // Pass data and navigate function to parent
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        {errors && <p className="text-red-500 text-sm">{errors}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required className="input-field" />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="input-field" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="input-field" />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required className="input-field" />
          <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required className="input-field" />
          
          <select name="gender" onChange={handleChange} required className="input-field">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          
          <input type="date" name="dob" onChange={handleChange} required className="input-field" />
          <textarea name="address" placeholder="Address" onChange={handleChange} required className="input-field"></textarea>
          <textarea name="medicalHistory" placeholder="Medical History (Optional)" onChange={handleChange} className="input-field"></textarea>
          
          <select name="role" onChange={handleChange} required className="input-field">
            <option value="patient">Patient</option>
            <option value="therapist">Therapist</option>
            <option value="supervisor">Supervisor</option>
          </select>
          
          <button type="submit" className="btn">Register</button>
        </form>
        <p className="text-sm mt-2">Already have an account? <a href="/login" className="text-blue-500">Login</a></p>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
//import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "", role: "patient" });
  const [error, setError] = useState("");
  //const navigate = useNavigate(); // Remove navigate here

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("🔵 Sending Login Data:", formData);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();
      console.log("🟢 Login Response:", data);

      if (response.ok) {
        //No need to set local storage here it is done in AppRoutes
        //No need to navigate here it is done in AppRoutes

        onLogin(data.user); // Just pass the user data to the parent
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Server error. Please try again later.");
    }
  };

  const handleChange = (e) => { // Define handleChange *inside* the component
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange} // Pass the *correct* handleChange
            required
            className="input-field"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange} // Pass the *correct* handleChange
            required
            className="input-field"
          />
          <select
            name="role"
            onChange={handleChange} // Pass the *correct* handleChange
            required
            className="input-field"
          >
            <option value="patient">Patient</option>
            <option value="therapist">Therapist</option>
            <option value="supervisor">Supervisor</option>
          </select>
          <button type="submit" className="btn">
            Login
          </button>
        </form>
        <p className="text-sm mt-2">
          Don't have an account?
          <a href="/register" className="text-blue-500">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

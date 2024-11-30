import React, { useState } from "react";
import "./App.css";
import logo from './gym-logo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for showing/hiding password

const App = () => {
  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={logo} alt="Gym Logo" className="logo-image" />
        </div>
        <h1 className="gym-title">CAVIN FITNESS GYM</h1>
        <h2 className="welcome-text">Welcome!</h2>
        <p className="login-description">
          Log in to access tools for managing transactions, accounts, and system data.
        </p>
        <form>
          <div className="input-container">
            <label htmlFor="password"></label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"} // Toggle between password and text
                id="password"
                placeholder="Password"
                className="password-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;

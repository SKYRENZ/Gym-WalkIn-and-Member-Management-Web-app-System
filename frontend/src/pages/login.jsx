import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login/login.css";
import logo from "../assets/gym-logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Attempting to log in with password:', password);

    // Construct the API URL
    const apiUrl = `${import.meta.env.VITE_API_URL}/staffLogin`;
    console.log('Fetching:', apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        
        // Store session information
        localStorage.setItem('staffToken', data.staff.staff_id);
        localStorage.setItem('staffRole', data.staff.role);
        
        // Navigate based on role
        if (data.staff.role === 'admin') {
          navigate('/admin');
        } else if (data.staff.role === 'staff') {
          navigate('/counter');
        }
      } else {
        const errorData = await response.json();
        console.error('Login error:', errorData.error);
        alert(errorData.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

return (
  <div className="login-page">
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
        <form onSubmit={handleLogin}>
          <div className="input-container">
            <label htmlFor="password"></label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                className="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update password state
                required
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
  </div>
);
};

export default LoginPage;
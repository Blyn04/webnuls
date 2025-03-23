// src/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../backend/firebase/FirebaseConfig";

import "./styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  const navigate = useNavigate();

  const adminCredentials = {
    email: "mikmik@nu-moa.edu.ph",
    password: "mikmik",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { email, password } = formData;

      if (email === adminCredentials.email && password === adminCredentials.password) {
        navigate("/accounts", { state: { loginSuccess: true, role: "super-admin" } });

      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
        navigate("/dashboard", { state: { loginSuccess: true, role: "user" } });
      }

    } catch (error) {
      console.error("Error during login:", error.message);
      setError("Invalid email or password. Please try again.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setResetEmail("");
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert(`Password reset link sent to ${resetEmail}`);
      closeModal();
      
    } catch (error) {
      console.error("Error sending reset link:", error.message);
      alert("Error sending password reset link. Please check your email.");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      closeModal();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <span
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "🔒" : "👁️"}
              </span>
            </div>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

          <p className="forgot-password" onClick={openModal}>
            Forgot Password?
          </p>
        </form>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content">
            <h3 className="modal-title">Reset Password</h3>
            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label>Enter your email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <button type="submit" className="modal-btn">
                Send Reset Link
              </button>
              <button type="button" className="modal-close-btn" onClick={closeModal}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

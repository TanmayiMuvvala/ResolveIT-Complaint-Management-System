import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Register.css";

export default function Register() {
  const nav = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (data.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password
      });

      if (res.data.status === "success") {
        alert("Registration successful! Please login.");
        nav("/login");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-bg register-container">
      <div className="modern-card register-card">
        {/* Decorative elements */}
        <div className="register-decorative-element"></div>

        <div className="register-header">
          <div className="register-icon">
            📝
          </div>
          <h2 className="register-title">
            Join ResolveIt
          </h2>
          <p className="register-subtitle">
            Create your citizen account
          </p>
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="register-form">
          <div className="register-form-group">
            <input
              type="text"
              placeholder="Full Name"
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
              className="modern-input"
              required
            />
          </div>

          <div className="register-form-group">
            <input
              type="email"
              placeholder="Email Address"
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
              className="modern-input"
              required
            />
          </div>

          <div className="register-form-group">
            <input
              type="password"
              placeholder="Create Password"
              value={data.password}
              onChange={e => setData({ ...data, password: e.target.value })}
              className="modern-input"
              required
            />
          </div>

          <div className="register-form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={data.confirmPassword}
              onChange={e => setData({ ...data, confirmPassword: e.target.value })}
              className="modern-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-secondary register-submit-button"
          >
            {loading ? (
              <div className="register-loading-content">
                <span className="loading-spinner register-loading-spinner"></span>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Password Requirements */}
        <div className="password-requirements">
          <p className="password-requirements-title">
            Password Requirements:
          </p>
          <ul className="password-requirements-list">
            <li>At least 6 characters long</li>
            <li>Mix of letters and numbers recommended</li>
          </ul>
        </div>

        <div className="nav-section register-nav-section">
          <p className="register-nav-text">
            Already have an account?
          </p>
          <Link 
            to="/login" 
            className="btn-primary register-login-button"
          >
            Sign In
          </Link>
        </div>

        <div className="register-back-link">
          <Link 
            to="/" 
            className="modern-link"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

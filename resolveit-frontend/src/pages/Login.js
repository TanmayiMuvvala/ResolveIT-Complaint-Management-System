import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", data);

      if (res.data.status === "success") {
        login(res.data.token, res.data.user);
        
        // Role-based redirect
        const userRoles = res.data.user.roles;
        if (userRoles.includes("ROLE_OFFICER") || userRoles.includes("ROLE_ADMIN")) {
          nav("/officer-dashboard");
        } else {
          nav("/dashboard");
        }
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-bg login-container">
      <div className="modern-card login-card">
        {/* Decorative elements */}
        <div className="login-decorative-element"></div>

        <div className="login-header">
          <div className="login-icon">
            👤
          </div>
          <h2 className="login-title">
            Welcome Back
          </h2>
          <p className="login-subtitle">
            Sign in to your ResolveIt account
          </p>
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="login-form">
          <div className="login-form-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
              className="modern-input"
              required
            />
          </div>

          <div className="login-form-group">
            <input
              type="password"
              placeholder="Enter your password"
              value={data.password}
              onChange={e => setData({ ...data, password: e.target.value })}
              className="modern-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary login-submit-button"
          >
            {loading ? (
              <div className="login-loading-content">
                <span className="loading-spinner login-loading-spinner"></span>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="login-forgot-password">
          <Link 
            to="/forgot-password" 
            className="modern-link login-forgot-link"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="nav-section login-nav-section">
          <p className="login-nav-text">
            Don't have an account?
          </p>
          <Link 
            to="/register" 
            className="btn-secondary login-register-button"
          >
            Register as Citizen
          </Link>
        </div>

        <div className="nav-section login-officer-section">
          <p className="login-nav-text">
            Are you an officer?
          </p>
          <Link 
            to="/officer-login" 
            className="btn-officer login-officer-button"
          >
            🔒 Access Officer Portal
          </Link>
        </div>

        <div className="login-back-link">
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

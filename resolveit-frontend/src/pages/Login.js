import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useUIState } from "../hooks/useUIState";
import UIStateMessage from "../components/UIStateMessage";
import "../styles/Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const uiState = useUIState();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const submit = async (e) => {
    e.preventDefault();
    uiState.setLoading();

    try {
      const res = await api.post("/auth/login", data);

      if (res.data.status === "success") {
        uiState.setSuccess("Login successful! Redirecting...");
        
        login(res.data.token, res.data.user);
        
        // Role-based redirect after brief success display
        setTimeout(() => {
          const userRoles = res.data.user.roles;
          if (userRoles.includes("ROLE_OFFICER") || userRoles.includes("ROLE_ADMIN")) {
            nav("/officer-dashboard");
          } else {
            nav("/dashboard");
          }
        }, 1500);
      } else {
        uiState.setError(res.data.message);
      }
    } catch (err) {
      uiState.setError("Login failed. Please try again.");
    }
  };

  const handleRetry = () => {
    uiState.reset();
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

        <UIStateMessage 
          state={uiState.state} 
          message={uiState.message} 
          onRetry={handleRetry}
        />

        <form onSubmit={submit} className="login-form">
          <div className="login-form-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
              className="modern-input"
              required
              disabled={uiState.isLoading || uiState.isSuccess}
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
              disabled={uiState.isLoading || uiState.isSuccess}
            />
          </div>

          <button
            type="submit"
            disabled={uiState.isLoading || uiState.isSuccess}
            className="btn-primary login-submit-button"
          >
            {uiState.isLoading ? (
              <div className="login-loading-content">
                <span className="loading-spinner login-loading-spinner"></span>
                Signing in...
              </div>
            ) : uiState.isSuccess ? (
              "✅ Success!"
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

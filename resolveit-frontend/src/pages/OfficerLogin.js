import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useUIState } from "../hooks/useUIState";
import UIStateMessage from "../components/UIStateMessage";

export default function OfficerLogin() {
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
        const userRoles = res.data.user.roles;
        
        // Check if user has officer or admin role
        if (userRoles.includes("ROLE_OFFICER") || userRoles.includes("ROLE_ADMIN")) {
          uiState.setSuccess("Access granted! Redirecting to officer dashboard...");
          login(res.data.token, res.data.user);
          setTimeout(() => nav("/officer-dashboard"), 1500);
        } else {
          uiState.setError("Access denied. Officer credentials required.");
        }
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
    <div className="animated-bg" style={{ 
      background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)",
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      padding: "20px"
    }}>
      <div className="modern-card" style={{
        padding: "50px 40px",
        width: "100%",
        maxWidth: "450px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative elements */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "100px",
          height: "100px",
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
          borderRadius: "50%",
          opacity: "0.1"
        }}></div>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ 
            fontSize: "3rem", 
            marginBottom: "15px",
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            🛡️
          </div>
          <h2 style={{ 
            color: "#333", 
            marginBottom: "10px",
            fontSize: "2rem",
            fontWeight: "700"
          }}>
            Officer Portal
          </h2>
          <p style={{ 
            color: "#666", 
            fontSize: "16px"
          }}>
            Authorized Personnel Only
          </p>
        </div>

        {/* Security Warning */}
        <div style={{ 
          background: "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 36, 0.1) 100%)",
          border: "1px solid rgba(255, 107, 107, 0.2)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>⚠️</div>
          <p style={{ 
            margin: "0", 
            fontSize: "14px", 
            color: "#d63031",
            fontWeight: "500"
          }}>
            This portal is restricted to authorized officers only. 
            Unauthorized access is prohibited and monitored.
          </p>
        </div>

        <UIStateMessage 
          state={uiState.state} 
          message={uiState.message} 
          onRetry={handleRetry}
        />

        <form onSubmit={submit}>
          <div style={{ marginBottom: "25px" }}>
            <input
              type="email"
              placeholder="Officer Email Address"
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
              className="modern-input"
              required
              disabled={uiState.isLoading || uiState.isSuccess}
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <input
              type="password"
              placeholder="Secure Password"
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
            className="btn-officer"
            style={{
              width: "100%",
              marginBottom: "25px",
              fontSize: "16px",
              fontWeight: "600"
            }}
          >
            {uiState.isLoading ? (
              <>
                <span className="loading-spinner" style={{ marginRight: "10px" }}></span>
                Authenticating...
              </>
            ) : uiState.isSuccess ? (
              "✅ Access Granted!"
            ) : (
              "🔐 Access Officer Portal"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <Link 
            to="/forgot-password" 
            className="modern-link"
            style={{ fontSize: "14px" }}
          >
            Forgot your password?
          </Link>
        </div>

        <div className="nav-section" style={{ textAlign: "center" }}>
          <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px" }}>
            Not an officer?
          </p>
          <Link 
            to="/login" 
            className="btn-primary"
            style={{ 
              padding: "12px 25px",
              fontSize: "14px",
              textDecoration: "none"
            }}
          >
            👤 Citizen Login
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <Link 
            to="/" 
            className="modern-link"
            style={{ fontSize: "14px", color: "#999" }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
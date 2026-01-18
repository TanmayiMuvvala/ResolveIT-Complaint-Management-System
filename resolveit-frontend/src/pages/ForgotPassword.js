import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      
      if (res.data.status === "success") {
        setMessage("Password reset instructions have been sent to your email.");
        // In development, show the token
        if (res.data.token) {
          setMessage(prev => prev + ` (Dev token: ${res.data.token})`);
        }
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-bg" style={{ 
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "50%",
          opacity: "0.1"
        }}></div>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ 
            fontSize: "3rem", 
            marginBottom: "15px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            🔑
          </div>
          <h2 style={{ 
            color: "#333", 
            marginBottom: "10px",
            fontSize: "2rem",
            fontWeight: "700"
          }}>
            Reset Password
          </h2>
          <p style={{ 
            color: "#666", 
            fontSize: "16px"
          }}>
            Enter your email to receive reset instructions
          </p>
        </div>

        {message && (
          <div className="alert-success">
            {message}
          </div>
        )}

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "30px" }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="modern-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              marginBottom: "25px",
              fontSize: "16px",
              fontWeight: "600"
            }}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ marginRight: "10px" }}></span>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <Link 
            to="/login" 
            className="modern-link"
            style={{ fontSize: "14px" }}
          >
            ← Back to Login
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link 
            to="/" 
            className="modern-link"
            style={{ fontSize: "14px", color: "#999" }}
          >
            Back to Home
          </Link>
        </div>

        {/* Debug link for development */}
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <Link 
            to="/debug-forgot-password" 
            style={{ 
              fontSize: "12px", 
              color: "#999",
              textDecoration: "none"
            }}
          >
            🔧 Debug Mode
          </Link>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useUIState } from "../hooks/useUIState";
import UIStateMessage from "../components/UIStateMessage";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const uiState = useUIState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    uiState.setLoading();

    try {
      const res = await api.post("/auth/forgot-password", { email });
      
      if (res.data.status === "success") {
        let successMessage = "Password reset instructions have been sent to your email.";
        // In development, show the token
        if (res.data.token) {
          successMessage += ` (Dev token: ${res.data.token})`;
        }
        uiState.setSuccess(successMessage);
      } else {
        uiState.setError(res.data.message);
      }
    } catch (err) {
      uiState.setError("Failed to send reset email. Please try again.");
    }
  };

  const handleRetry = () => {
    uiState.reset();
  };

  return (
    <div className="animated-bg" style={{ 
      background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
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

        <UIStateMessage 
          state={uiState.state} 
          message={uiState.message} 
          onRetry={handleRetry}
        />

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "30px" }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="modern-input"
              required
              disabled={uiState.isLoading || uiState.isSuccess}
            />
          </div>

          <button
            type="submit"
            disabled={uiState.isLoading || uiState.isSuccess}
            className="btn-primary"
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
                Sending...
              </>
            ) : uiState.isSuccess ? (
              "✅ Email Sent!"
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
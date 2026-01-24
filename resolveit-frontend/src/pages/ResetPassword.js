import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useUIState } from "../hooks/useUIState";
import UIStateMessage from "../components/UIStateMessage";

export default function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const uiState = useUIState();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      uiState.setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      uiState.setError("Password must be at least 6 characters long");
      return;
    }

    uiState.setLoading();

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword: password
      });
      
      if (res.data.status === "success") {
        uiState.setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => nav("/login"), 2000);
      } else {
        uiState.setError(res.data.message);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      uiState.setError("Failed to reset password. Please try again.");
    }
  };

  const handleRetry = () => {
    uiState.reset();
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
          left: "-50px",
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
            🔐
          </div>
          <h2 style={{ 
            color: "#333", 
            marginBottom: "10px",
            fontSize: "2rem",
            fontWeight: "700"
          }}>
            Set New Password
          </h2>
          <p style={{ 
            color: "#666", 
            fontSize: "16px"
          }}>
            Enter your new secure password
          </p>
        </div>

        {/* Token Info */}
        {token && (
          <div style={{ 
            background: "rgba(102, 126, 234, 0.1)",
            border: "1px solid rgba(102, 126, 234, 0.2)",
            borderRadius: "12px",
            padding: "15px",
            marginBottom: "25px",
            textAlign: "center"
          }}>
            <p style={{ 
              margin: "0", 
              fontSize: "12px", 
              color: "#667eea",
              fontWeight: "500"
            }}>
              ✅ Valid reset token detected
            </p>
          </div>
        )}

        <UIStateMessage 
          state={uiState.state} 
          message={uiState.message} 
          onRetry={handleRetry}
        />

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "25px" }}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="modern-input"
              required
              disabled={uiState.isLoading || uiState.isSuccess}
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                Updating Password...
              </>
            ) : uiState.isSuccess ? (
              "✅ Password Updated!"
            ) : (
              "Update Password"
            )}
          </button>
        </form>

        {/* Password Requirements */}
        <div style={{ 
          background: "rgba(102, 126, 234, 0.1)",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          borderRadius: "12px",
          padding: "15px",
          marginBottom: "25px"
        }}>
          <p style={{ 
            margin: "0 0 10px 0", 
            fontSize: "14px", 
            color: "#667eea",
            fontWeight: "600"
          }}>
            Password Requirements:
          </p>
          <ul style={{ 
            margin: "0", 
            paddingLeft: "20px",
            fontSize: "12px", 
            color: "#666",
            lineHeight: "1.5"
          }}>
            <li>At least 6 characters long</li>
            <li>Mix of letters and numbers recommended</li>
          </ul>
        </div>

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
      </div>
    </div>
  );
}
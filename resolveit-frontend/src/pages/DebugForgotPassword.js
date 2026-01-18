import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function DebugForgotPassword() {
  const [email, setEmail] = useState("alice@example.com"); // Pre-fill with test email
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDebugInfo("");

    try {
      console.log("Sending forgot password request for:", email);
      const res = await api.post("/auth/forgot-password", { email });
      
      console.log("Response:", res.data);
      setDebugInfo(`Response: ${JSON.stringify(res.data, null, 2)}`);
      
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
      console.error("Forgot password error:", err);
      setError(`Failed to send reset email: ${err.message}`);
      setDebugInfo(`Error: ${JSON.stringify({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      }, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      const res = await api.get("/");
      console.log("Backend connection test:", res);
      setDebugInfo(`Backend connection: OK - ${JSON.stringify(res.data, null, 2)}`);
    } catch (err) {
      console.error("Backend connection error:", err);
      setDebugInfo(`Backend connection: FAILED - ${err.message}`);
    }
  };

  const testEmailConfiguration = async () => {
    try {
      // Try to send a test forgot password request to see if email is configured
      const res = await api.post("/auth/forgot-password", { email: "test@example.com" });
      console.log("Email test response:", res.data);
      
      if (res.data.message.includes("email delivery failed")) {
        setDebugInfo(`Email Configuration: NOT CONFIGURED - ${res.data.message}`);
      } else if (res.data.message.includes("sent to your email")) {
        setDebugInfo(`Email Configuration: CONFIGURED ✅ - Emails are being sent successfully`);
      } else {
        setDebugInfo(`Email Configuration: UNKNOWN - ${JSON.stringify(res.data, null, 2)}`);
      }
    } catch (err) {
      console.error("Email configuration test error:", err);
      setDebugInfo(`Email Configuration: ERROR - ${err.message}`);
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
        maxWidth: "600px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ 
            color: "#333", 
            marginBottom: "10px",
            fontSize: "2rem",
            fontWeight: "700"
          }}>
            🔧 Debug Forgot Password
          </h2>
          <p style={{ 
            color: "#666", 
            fontSize: "16px"
          }}>
            Testing forgot password functionality
          </p>
        </div>

        {/* Email Configuration Info */}
        <div style={{ 
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "25px"
        }}>
          <h3 style={{ 
            color: "#667eea", 
            marginTop: "0",
            marginBottom: "15px",
            fontSize: "1.1rem"
          }}>
            📧 Email Configuration Required
          </h3>
          <p style={{ 
            margin: "0 0 10px 0", 
            fontSize: "14px", 
            color: "#666",
            lineHeight: "1.5"
          }}>
            To send actual emails, configure SMTP settings in <code>application.properties</code>:
          </p>
          <ul style={{ 
            margin: "10px 0 0 0", 
            paddingLeft: "20px",
            fontSize: "12px", 
            color: "#666",
            lineHeight: "1.5"
          }}>
            <li>Set your email provider (Gmail, Outlook, etc.)</li>
            <li>Add your email credentials</li>
            <li>See <strong>EMAIL_SETUP_GUIDE.md</strong> for detailed instructions</li>
          </ul>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={testBackendConnection}
            className="btn-secondary"
            style={{ width: "100%", marginBottom: "10px" }}
          >
            Test Backend Connection
          </button>
          
          <button
            onClick={testEmailConfiguration}
            className="btn-officer"
            style={{ width: "100%", marginBottom: "20px" }}
          >
            Test Email Configuration
          </button>
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

        {debugInfo && (
          <div style={{
            background: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            fontSize: "12px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            maxHeight: "200px",
            overflow: "auto"
          }}>
            <strong>Debug Info:</strong><br />
            {debugInfo}
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <Link 
            to="/forgot-password" 
            className="modern-link"
            style={{ fontSize: "14px" }}
          >
            ← Back to Normal Forgot Password
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
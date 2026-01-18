import React from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/Success.css";

export default function Success() {
  const { id } = useParams();

  return (
    <div className="success-container">
      <div className="success-content">
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>✅</div>
        <h1 className="success-title">Complaint Submitted Successfully!</h1>
        <h2 className="success-subtitle">Your Complaint ID:</h2>
        <div className="success-complaint-id">#{id}</div>
        <p className="success-message">
          Save this ID for future tracking. You can use it to check the status of your complaint.
        </p>
        
        <div className="success-actions">
          <Link to="/dashboard" className="success-button primary">
            Go to Dashboard
          </Link>
          <Link to="/complaint-form" className="success-button secondary">
            Submit Another Complaint
          </Link>
        </div>
      </div>
    </div>
  );
}

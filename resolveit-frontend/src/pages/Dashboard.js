import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationBell from "../components/NotificationBell";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { auth, logout, isUser, isOfficer } = useContext(AuthContext);
  const nav = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.token) {
      nav("/login");
      return;
    }

    fetchComplaints();
  }, [auth.token, nav]);

  const fetchComplaints = async () => {
    try {
      let endpoint;
      if (isUser()) {
        endpoint = `/complaints/user/${auth.user.id}`;
      } else if (isOfficer()) {
        endpoint = `/complaints/officer/assigned`;
      }

      const res = await api.get(endpoint);
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase().replace("_", "-") || "new";

    return (
      <span className={`dashboard-status-badge ${statusClass}`}>
        {status?.replace("_", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClass = priority?.toLowerCase() || "low";

    return (
      <span className={`dashboard-priority-badge ${priorityClass}`}>
        {priority}
      </span>
    );
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">{isUser() ? "My Complaints" : "Assigned Complaints"}</h2>
        <div className="dashboard-actions">
          <NotificationBell />
          <span className="welcome-text">
            Welcome, {auth.user?.name}
          </span>
          {isUser() && (
            <>
              <button
                onClick={() => nav("/request-officer-role")}
                className="officer-request-button"
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  marginRight: '10px'
                }}
              >
                👮 Request Officer Role
              </button>
              <button
                onClick={() => nav("/complaint-form")}
                className="new-complaint-button"
              >
                New Complaint
              </button>
            </>
          )}
          <button
            onClick={logout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          {isUser() ? "No complaints submitted yet." : "No complaints assigned yet."}
        </div>
      ) : (
        <div className="complaints-grid">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="complaint-card"
            >
              <div className="complaint-card-header">
                <h4 className="complaint-card-title">{complaint.title}</h4>
                <div className="complaint-card-badges">
                  {getPriorityBadge(complaint.priority)}
                  {getStatusBadge(complaint.status)}
                </div>
              </div>

              <p className="complaint-card-description">
                {complaint.description}
              </p>

              <div className="complaint-card-footer">
                <div className="complaint-card-meta">
                  <span><strong>Category:</strong> {complaint.category || "N/A"}</span>
                  <span><strong>ID:</strong> #{complaint.id}</span>
                  <span><strong>Created:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => nav(`/complaint/${complaint.id}`)}
                  className="view-details-button"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

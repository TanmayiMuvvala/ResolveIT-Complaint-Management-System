import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationBell from "../components/NotificationBell";
import "../styles/OfficerDashboard.css";

export default function OfficerDashboard() {
  const { auth, logout, isOfficer, isAdmin } = useContext(AuthContext);
  const nav = useNavigate();
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [unassignedComplaints, setUnassignedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned");

  useEffect(() => {
    if (!auth.token || (!isOfficer() && !isAdmin())) {
      nav("/login");
      return;
    }

    fetchComplaints();
  }, [auth.token, nav]);

  const fetchComplaints = async () => {
    try {
      const [assignedRes, unassignedRes] = await Promise.all([
        api.get("/complaints/officer/assigned"),
        api.get("/complaints/officer/unassigned")
      ]);

      setAssignedComplaints(assignedRes.data);
      setUnassignedComplaints(unassignedRes.data);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (complaintId, statusCode, comment = "") => {
    try {
      await api.put(`/complaints/${complaintId}/status`, {
        statusCode,
        comment,
        assignedOfficerId: auth.user.id
      });

      // Refresh complaints
      fetchComplaints();
      alert("Status updated successfully!");
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const assignToSelf = async (complaintId) => {
    await updateStatus(complaintId, "UNDER_REVIEW", "Complaint assigned to officer");
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase().replace("_", "-") || "new";

    return (
      <span className={`officer-status-badge ${statusClass}`}>
        {status?.replace("_", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClass = priority?.toLowerCase() || "low";

    return (
      <span className={`officer-priority-badge ${priorityClass}`}>
        {priority}
      </span>
    );
  };

  const renderComplaintCard = (complaint, showAssignButton = false) => (
    <div
      key={complaint.id}
      className="officer-complaint-card"
    >
      <div className="officer-complaint-header">
        <h4 className="officer-complaint-title">{complaint.title}</h4>
        <div className="officer-complaint-badges">
          {getPriorityBadge(complaint.priority)}
          {getStatusBadge(complaint.status)}
        </div>
      </div>

      <p className="officer-complaint-description">
        {complaint.description}
      </p>

      <div className="officer-complaint-meta">
        <strong>Category:</strong> {complaint.category || "N/A"} |{" "}
        <strong>ID:</strong> #{complaint.id} |{" "}
        <strong>Created:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
        {complaint.user && !complaint.anonymous && (
          <span> | <strong>User:</strong> {complaint.user.fullName}</span>
        )}
      </div>

      <div className="officer-complaint-actions">
        <button
          onClick={() => nav(`/complaint/${complaint.id}`)}
          className="officer-action-button view-details"
        >
          View Details
        </button>

        {showAssignButton && (
          <button
            onClick={() => assignToSelf(complaint.id)}
            className="officer-action-button assign"
          >
            Assign to Me
          </button>
        )}

        {!showAssignButton && (
          <>
            <button
              onClick={() => updateStatus(complaint.id, "IN_PROGRESS", "Work started on complaint")}
              className="officer-action-button start-work"
            >
              Start Work
            </button>
            <button
              onClick={() => updateStatus(complaint.id, "RESOLVED", "Complaint has been resolved")}
              className="officer-action-button resolve"
            >
              Mark Resolved
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="officer-loading-container">Loading...</div>;
  }

  return (
    <div className="officer-dashboard-container">
      <div className="officer-dashboard-header">
        <h2 className="officer-dashboard-title">Officer Dashboard</h2>
        <div className="officer-dashboard-actions">
          <NotificationBell />
          {isAdmin() && (
            <button
              onClick={() => nav("/manage-officer-requests")}
              className="officer-action-button"
              style={{
                marginRight: '10px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              }}
            >
              👮 Manage Officer Requests
            </button>
          )}
          <button
            onClick={() => nav("/reports")}
            className="officer-action-button"
            style={{ marginRight: '10px' }}
          >
            📊 Reports
          </button>
          <span className="officer-welcome-text">
            Welcome, Officer {auth.user?.name}
          </span>
          <button
            onClick={logout}
            className="officer-logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="officer-tab-navigation">
        <button
          onClick={() => setActiveTab("assigned")}
          className={`officer-tab-button ${activeTab === "assigned" ? "active" : "inactive"}`}
        >
          My Assigned ({assignedComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab("unassigned")}
          className={`officer-tab-button ${activeTab === "unassigned" ? "active" : "inactive"}`}
        >
          Unassigned ({unassignedComplaints.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "assigned" && (
        <div className="officer-tab-content">
          <h3>My Assigned Complaints</h3>
          {assignedComplaints.length === 0 ? (
            <div className="officer-empty-state">
              No complaints assigned yet.
            </div>
          ) : (
            <div className="officer-complaints-grid">
              {assignedComplaints.map((complaint) => renderComplaintCard(complaint, false))}
            </div>
          )}
        </div>
      )}

      {activeTab === "unassigned" && (
        <div className="officer-tab-content">
          <h3>Unassigned Complaints</h3>
          {unassignedComplaints.length === 0 ? (
            <div className="officer-empty-state">
              No unassigned complaints.
            </div>
          ) : (
            <div className="officer-complaints-grid">
              {unassignedComplaints.map((complaint) => renderComplaintCard(complaint, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
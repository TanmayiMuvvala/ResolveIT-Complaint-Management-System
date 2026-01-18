import React, { useState, useContext } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/ComplaintForm.css";

export default function ComplaintForm() {
  const nav = useNavigate();
  const { auth } = useContext(AuthContext);

  const [data, setData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "LOW",
    anonymous: false,
    userId: auth.user?.id || null,
  });

  const [files, setFiles] = useState([]);

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));

    for (let f of files) {
      formData.append("files", f);
    }

    try {
      const res = await api.post("/complaints/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.status === "success") {
        nav(`/success/${res.data.complaintId}`);
      } else {
        alert(res.data.message || "Failed to submit complaint");
      }
    } catch (err) {
      alert("Failed to submit complaint");
    }
  };

  return (
    <div className="complaint-form-container">
      <h2 className="complaint-form-title">Submit Complaint</h2>

      <form onSubmit={submit} className="complaint-form">
        {/* Public / Anonymous Choice */}
        <div className="form-group">
          <label className="form-label">Submission Type</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="mode"
                value="public"
                checked={!data.anonymous}
                onChange={() => setData({ ...data, anonymous: false })}
              />
              Public
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="mode"
                value="anonymous"
                checked={data.anonymous}
                onChange={() => setData({ ...data, anonymous: true })}
              />
              Anonymous
            </label>
          </div>
        </div>

        {/* Mode Indicator */}
        <div className={`mode-indicator ${data.anonymous ? 'anonymous' : ''}`}>
          {data.anonymous ? 
            "🔒 Anonymous submission - Your identity will be protected" : 
            "👤 Public submission - Your name will be visible to officers"
          }
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Title/Subject *</label>
          <input
            type="text"
            placeholder="Brief description of the issue"
            value={data.title}
            onChange={e => setData({ ...data, title: e.target.value })}
            className="form-input"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            value={data.category}
            onChange={e => setData({ ...data, category: e.target.value })}
            className="form-select"
          >
            <option value="">Select Category</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Public Services">Public Services</option>
            <option value="Safety">Safety</option>
            <option value="Environment">Environment</option>
            <option value="Transportation">Transportation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Priority */}
        <div className="form-group">
          <label className="form-label">Priority Level</label>
          <select
            value={data.priority}
            onChange={e => setData({ ...data, priority: e.target.value })}
            className="form-select"
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Detailed Description *</label>
          <textarea
            placeholder="Please provide a detailed description of the issue, including location, time, and any other relevant information..."
            value={data.description}
            onChange={e => setData({ ...data, description: e.target.value })}
            className="form-textarea"
            required
          />
        </div>

        {/* File Upload */}
        <div className="form-group">
          <label className="form-label">Attachments (Optional)</label>
          <input
            multiple
            type="file"
            onChange={e => setFiles([...e.target.files])}
            className="file-input"
            accept="image/*,.pdf,.doc,.docx"
          />
          <small style={{ color: '#666', fontSize: '14px' }}>
            Supported formats: Images, PDF, Word documents
          </small>
        </div>

        <button 
          type="submit"
          className="submit-button"
        >
          Submit Complaint
        </button>
      </form>

      <div className="back-to-dashboard">
        <a href="/dashboard" className="back-link">← Back to Dashboard</a>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import EscalationButton from "../components/EscalationButton";
import "../styles/ComplaintDetail.css";

export default function ComplaintDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { auth, isOfficer, isAdmin } = useContext(AuthContext);
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
    fetchComments();
    fetchFiles();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data);
    } catch (err) {
      console.error("Failed to fetch complaint:", err);
      alert("Complaint not found");
      nav("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/complaints/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/complaints/${id}/files`);
      if (res.data.status === 'success') {
        setFiles(res.data.files);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/complaints/${id}/comments`, {
        message: newComment,
        isPrivate
      });

      setNewComment("");
      setIsPrivate(false);
      fetchComments();
      alert("Comment added successfully!");
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  const updateStatus = async (statusCode, comment = "") => {
    try {
      await api.put(`/complaints/${id}/status`, {
        statusCode,
        comment,
        assignedOfficerId: auth.user.id
      });

      fetchComplaintDetails();
      fetchComments();
      alert("Status updated successfully!");
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase().replace("_", "-") || "new";
    
    return (
      <span className={`status-badge ${statusClass}`}>
        {status?.replace("_", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClass = priority?.toLowerCase() || "low";

    return (
      <span className={`priority-badge ${priorityClass}`}>
        {priority}
      </span>
    );
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!complaint) {
    return <div className="not-found-container">Complaint not found</div>;
  }

  return (
    <div className="complaint-detail-container">
      <button
        onClick={() => nav("/dashboard")}
        className="back-button"
      >
        ← Back to Dashboard
      </button>

      {/* Complaint Header */}
      <div className="complaint-header">
        <div className="complaint-title-row">
          <h2 className="complaint-title">{complaint.title}</h2>
          <div className="badge-container">
            {getPriorityBadge(complaint.priority)}
            {getStatusBadge(complaint.status)}
          </div>
        </div>

        <div className="complaint-info-grid">
          <div><strong>ID:</strong> #{complaint.id}</div>
          <div><strong>Category:</strong> {complaint.category || "N/A"}</div>
          <div><strong>Created:</strong> {new Date(complaint.createdAt).toLocaleString()}</div>
          <div><strong>Updated:</strong> {new Date(complaint.updatedAt).toLocaleString()}</div>
          <div>
            <strong>Submitted by:</strong>{" "}
            {complaint.anonymous ? "Anonymous" : complaint.user?.fullName || "N/A"}
          </div>
          <div>
            <strong>Assigned Officer:</strong>{" "}
            {complaint.assignedOfficer?.fullName || "Unassigned"}
          </div>
        </div>
      </div>

      {/* Complaint Description */}
      <div className="complaint-description">
        <h4>Description</h4>
        <p>{complaint.description}</p>
      </div>

      {/* Attached Files */}
      {files.length > 0 && (
        <div className="complaint-files">
          <h4>Attached Files</h4>
          <div className="files-grid">
            {files.map((file) => (
              <FileDisplay key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}

      {/* Officer Actions */}
      {(isOfficer() || isAdmin()) && (
        <div className="officer-actions">
          <h4>Officer Actions</h4>
          <div className="action-buttons">
            <button
              onClick={() => updateStatus("UNDER_REVIEW", "Complaint is under review")}
              className="action-button under-review"
            >
              Mark Under Review
            </button>
            <button
              onClick={() => updateStatus("IN_PROGRESS", "Work has started on this complaint")}
              className="action-button in-progress"
            >
              Start Work
            </button>
            <button
              onClick={() => updateStatus("RESOLVED", "Complaint has been resolved")}
              className="action-button resolved"
            >
              Mark Resolved
            </button>
            <EscalationButton 
              complaintId={id} 
              onEscalated={() => {
                fetchComplaintDetails();
                fetchComments();
              }} 
            />
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="comments-section">
        <h4>Comments & Updates</h4>

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`comment-item ${comment.isPrivate ? 'private' : 'public'}`}
              >
                <div className="comment-header">
                  <strong className="comment-author">{comment.author?.fullName || "System"}</strong>
                  <small className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                    {comment.isPrivate && (
                      <span className="comment-private-label">(Private)</span>
                    )}
                  </small>
                </div>
                <p className="comment-message">{comment.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form (Officers only) */}
        {(isOfficer() || isAdmin()) && (
          <form onSubmit={addComment} className="comment-form">
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment or update..."
                required
              />
            </div>
            <div className="comment-form-footer">
              <label className="private-checkbox">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Private comment (internal use only)
              </label>
              <button
                type="submit"
                className="submit-comment-button"
              >
                Add Comment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// File Display Component
function FileDisplay({ file }) {
  const isImage = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const isVideo = (fileName) => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const isPDF = (fileName) => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  const getFileIcon = (fileName) => {
    if (isImage(fileName)) return '🖼️';
    if (isVideo(fileName)) return '🎥';
    if (isPDF(fileName)) return '📄';
    return '📎';
  };

  const handleDownload = () => {
    window.open(file.downloadUrl, '_blank');
  };

  const handleView = () => {
    const viewUrl = file.viewUrl || file.downloadUrl.replace('/download', '/view');
    window.open(viewUrl, '_blank');
  };

  return (
    <div className="file-item">
      <div className="file-header">
        <span className="file-icon">{getFileIcon(file.fileName)}</span>
        <span className="file-name" title={file.fileName}>
          {file.fileName.length > 30 ? 
            file.fileName.substring(0, 30) + '...' : 
            file.fileName
          }
        </span>
      </div>
      
      {/* Preview for images */}
      {isImage(file.fileName) && (
        <div className="file-preview">
          <img 
            src={file.viewUrl || file.downloadUrl.replace('/download', '/view')} 
            alt={file.fileName}
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            onClick={handleView}
          />
        </div>
      )}
      
      {/* Preview for videos */}
      {isVideo(file.fileName) && (
        <div className="file-preview">
          <video 
            controls
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              borderRadius: '8px'
            }}
          >
            <source src={file.viewUrl || file.downloadUrl.replace('/download', '/view')} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      <div className="file-actions">
        {(isImage(file.fileName) || isPDF(file.fileName)) && (
          <button 
            onClick={handleView}
            className="file-action-btn view-btn"
          >
            👁️ View
          </button>
        )}
        <button 
          onClick={handleDownload}
          className="file-action-btn download-btn"
        >
          📥 Download
        </button>
      </div>
    </div>
  );
}
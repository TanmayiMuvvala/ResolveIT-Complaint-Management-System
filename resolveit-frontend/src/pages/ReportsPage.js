import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/ReportsPage.css';

export default function ReportsPage() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [categoryReports, setCategoryReports] = useState([]);
  const [statusReports, setStatusReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Use user-specific endpoints instead of system-wide
      const [dashRes, catRes, statRes] = await Promise.all([
        api.get('/api/reports/my/dashboard'),
        api.get('/api/reports/my/categories'),
        api.get('/api/reports/my/status')
      ]);

      if (dashRes.data.status === 'success') {
        setDashboardStats(dashRes.data.stats);
      }
      if (catRes.data.status === 'success') {
        setCategoryReports(catRes.data.reports);
      }
      if (statRes.data.status === 'success') {
        setStatusReports(statRes.data.reports);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      // Use user-specific CSV export
      const response = await api.get('/api/reports/my/export/csv', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_complaints_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export report');
    }
  };

  const exportPDF = async () => {
    try {
      // Use user-specific PDF export
      const response = await api.get('/api/reports/my/export/pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_complaints_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to export PDF report');
    }
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-wrapper">
          <div className="loading-state">
            <div className="loading-icon">📊</div>
            <p>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-wrapper">
        {/* Header */}
        <div className="reports-header">
          <div className="reports-header-content">
            <div>
              <h1 className="reports-title">
                📊 My Reports & Analytics
              </h1>
              <p className="reports-subtitle">
                Your personal complaint management insights
              </p>
            </div>
            <div className="reports-export-buttons">
              <button
                onClick={exportCSV}
                className="btn-secondary"
              >
                📥 Export CSV
              </button>
              <button
                onClick={exportPDF}
                className="btn-secondary"
              >
                📄 Export PDF
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="reports-tabs">
            {['dashboard', 'categories', 'status'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`reports-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div>
            {/* Stats Cards */}
            <div className="stats-grid">
              <StatCard
                icon="📝"
                title="Total Complaints"
                value={dashboardStats.totalComplaints}
                color="var(--color-primary-500)"
              />
              <StatCard
                icon="✅"
                title="Resolved"
                value={dashboardStats.resolvedComplaints}
                color="var(--color-success-500)"
              />
              <StatCard
                icon="⏳"
                title="Pending"
                value={dashboardStats.pendingComplaints}
                color="var(--color-warning-500)"
              />
              <StatCard
                icon="⚡"
                title="Escalated"
                value={dashboardStats.escalatedComplaints}
                color="var(--color-error-500)"
              />
              <StatCard
                icon="📅"
                title="Recent (7 days)"
                value={dashboardStats.recentComplaints}
                color="var(--color-secondary-500)"
              />
              <StatCard
                icon="⏱️"
                title="Avg Resolution Time"
                value={`${dashboardStats.averageResolutionTimeHours}h`}
                color="var(--color-info-500)"
              />
              <StatCard
                icon="🎯"
                title="Resolution Rate"
                value={`${dashboardStats.resolutionRate}%`}
                color="var(--color-accent-500)"
              />
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="reports-content">
            <h2>Category Analysis</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Resolved</th>
                    <th>Pending</th>
                    <th>Avg Time (hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryReports.map((report, index) => (
                    <tr key={index}>
                      <td>{report.category}</td>
                      <td>{report.totalCount}</td>
                      <td style={{ color: 'var(--color-success-400)' }}>
                        {report.resolvedCount}
                      </td>
                      <td style={{ color: 'var(--color-warning-400)' }}>
                        {report.pendingCount}
                      </td>
                      <td>
                        {report.averageResolutionTimeHours.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="reports-content">
            <h2>Status Distribution</h2>
            <div className="status-grid">
              {statusReports.map((report, index) => (
                <div key={index} className="status-card">
                  <div className="status-icon">
                    {getStatusIcon(report.status)}
                  </div>
                  <div className="status-count">
                    {report.count}
                  </div>
                  <div className="status-name">
                    {report.status}
                  </div>
                  <div className="status-percentage">
                    {report.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="back-section">
          <Link to="/officer-dashboard" className="modern-link">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">
        {value}
      </div>
      <div className="stat-title">{title}</div>
    </div>
  );
}

function getStatusIcon(status) {
  const icons = {
    'New': '🆕',
    'Under Review': '👀',
    'In Progress': '⚙️',
    'Resolved': '✅',
    'Escalated': '⚡'
  };
  return icons[status] || '📋';
}
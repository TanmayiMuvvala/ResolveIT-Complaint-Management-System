import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="animated-bg home-container">
      {/* Main Hero Section */}
      <div className="glass-card home-hero-card">
        {/* Hero Header */}
        <div className="home-hero-header">
          <h1 className="home-title">
            🏛️ ResolveIt
          </h1>
          
          <p className="home-subtitle">
            Empowering citizens and officers with a seamless complaint management platform. 
            Report issues, track progress, and build a better community together.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="home-action-buttons">
          <Link 
            to="/login"
            className="btn-primary home-action-button"
          >
            👤 Citizen Login
          </Link>
          
          <Link 
            to="/register"
            className="btn-secondary home-action-button"
          >
            📝 Register Now
          </Link>
        </div>

        {/* Officer Portal Section */}
        <div className="home-officer-section">
          <div className="home-officer-header">
            <span className="home-officer-icon">🔒</span>
            <h3 className="home-officer-title">
              Authorized Personnel Only
            </h3>
            <p className="home-officer-description">
              Secure access portal for government officers and administrators
            </p>
          </div>
          
          <Link 
            to="/officer-login"
            className="btn-officer home-officer-button"
          >
            🛡️ Officer Portal
          </Link>
        </div>

        {/* Features Grid */}
        <div className="home-features-grid">
          <div className="home-feature-card">
            <span className="home-feature-icon">👥</span>
            <h4 className="home-feature-title">
              For Citizens
            </h4>
            <ul className="home-feature-list">
              <li>✅ Submit complaints easily</li>
              <li>📊 Track complaint status</li>
              <li>🔒 Anonymous submissions</li>
              <li>📎 File attachments support</li>
              <li>📱 Mobile-friendly interface</li>
            </ul>
          </div>
          
          <div className="home-feature-card">
            <span className="home-feature-icon">🛡️</span>
            <h4 className="home-feature-title">
              For Officers
            </h4>
            <ul className="home-feature-list">
              <li>📋 Manage assigned complaints</li>
              <li>🔄 Update complaint status</li>
              <li>💬 Add comments & notes</li>
              <li>⚡ Escalate critical issues</li>
              <li>📈 Performance analytics</li>
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div className="home-stats-section">
          <div className="home-stat-item">
            <div className="home-stat-number">24/7</div>
            <div className="home-stat-label">Available</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-number">100%</div>
            <div className="home-stat-label">Secure</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-number">Fast</div>
            <div className="home-stat-label">Response</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="home-footer">
        <p>© 2024 ResolveIt - Building Better Communities Together</p>
      </div>
    </div>
  );
}

-- =====================================================
-- RESOLVEIT - COMPLETE DATABASE SCHEMA
-- Production-Ready Database Structure Only
-- =====================================================
-- 
-- This is the complete database schema for the ResolveIt
-- Complaint Management System including all features:
-- - User Management & Authentication
-- - Role-Based Access Control (USER, OFFICER, ADMIN)
-- - Complaint Management with Status Tracking
-- - File Attachments & Comments
-- - Notifications System
-- - Officer Role Requests
-- - Escalation System
-- - Password Reset Functionality
-- 
-- Author: ResolveIt Development Team
-- Version: 1.0 Final
-- Date: January 2026
-- =====================================================

-- Drop and recreate database for fresh installation
DROP DATABASE IF EXISTS resolveit;
CREATE DATABASE resolveit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE resolveit;

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Roles table for RBAC (Role-Based Access Control)
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table with authentication and profile information
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Junction table for many-to-many relationship between users and roles
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Password reset tokens for secure password recovery
CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- =====================================================
-- COMPLAINT MANAGEMENT SYSTEM
-- =====================================================

-- Complaint status lookup table
CREATE TABLE complaint_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    display VARCHAR(100) NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main complaints table
CREATE TABLE complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority ENUM('LOW','MEDIUM','HIGH') DEFAULT 'LOW',
    anonymous TINYINT(1) DEFAULT 0,
    user_id BIGINT NULL,
    status_id INT NOT NULL DEFAULT 1,
    assigned_officer_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (status_id) REFERENCES complaint_status(id),
    FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status_id),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_user (user_id),
    INDEX idx_officer (assigned_officer_id),
    INDEX idx_created (created_at)
);

-- File attachments for complaints
CREATE TABLE attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    filename VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    INDEX idx_complaint (complaint_id)
);

-- Comments and updates on complaints
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    author_id BIGINT NULL,
    message TEXT,
    is_private TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_complaint (complaint_id),
    INDEX idx_author (author_id),
    INDEX idx_created (created_at)
);

-- =====================================================
-- ESCALATION SYSTEM
-- =====================================================

-- Complaint escalations to higher authorities
CREATE TABLE escalations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    escalated_by BIGINT,
    escalated_to_role BIGINT NOT NULL,
    reason TEXT,
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved TINYINT(1) DEFAULT 0,
    resolved_at TIMESTAMP NULL,
    resolved_by BIGINT NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (escalated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (escalated_to_role) REFERENCES roles(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_complaint (complaint_id),
    INDEX idx_escalated_by (escalated_by),
    INDEX idx_resolved (resolved)
);

-- =====================================================
-- NOTIFICATIONS SYSTEM
-- =====================================================

-- In-app notifications for users
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    complaint_id BIGINT,
    type VARCHAR(50) DEFAULT 'INFO',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at),
    INDEX idx_complaint (complaint_id)
);

-- =====================================================
-- OFFICER ROLE REQUEST SYSTEM
-- =====================================================

-- Requests from users to become officers
CREATE TABLE officer_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    reviewed_by BIGINT NULL,
    review_comment TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_requested (requested_at)
);

-- =====================================================
-- ESSENTIAL MASTER DATA
-- =====================================================

-- Insert system roles (Required for application to function)
INSERT INTO roles (name) VALUES 
('ROLE_USER'),      -- Regular users who can submit complaints
('ROLE_OFFICER'),   -- Officers who can manage and resolve complaints
('ROLE_ADMIN');     -- Administrators with full system access

-- Insert complaint status options (Required for complaint workflow)
INSERT INTO complaint_status (code, display, description) VALUES
('NEW', 'New', 'Newly submitted complaint awaiting review'),
('UNDER_REVIEW', 'Under Review', 'Complaint is being reviewed by an officer'),
('IN_PROGRESS', 'In Progress', 'Work has started on resolving the complaint'),
('RESOLVED', 'Resolved', 'Complaint has been successfully resolved'),
('ESCALATED', 'Escalated', 'Complaint has been escalated to higher authorities'),
('CLOSED', 'Closed', 'Complaint has been closed without resolution');

-- =====================================================
-- DATABASE VERIFICATION
-- =====================================================

-- Verify table creation
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'resolveit' 
ORDER BY TABLE_NAME;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================
-- All necessary indexes have been created with the tables above
-- for optimal query performance on frequently accessed columns:
--
-- Users: username, email, is_active
-- Complaints: status_id, category, priority, user_id, assigned_officer_id, created_at
-- Comments: complaint_id, author_id, created_at
-- Notifications: user_id, is_read, created_at, complaint_id
-- Officer Requests: status, user_id, requested_at
-- Escalations: complaint_id, escalated_by, resolved
-- Password Reset Tokens: token, expires_at
-- Attachments: complaint_id

-- =====================================================
-- FOREIGN KEY CONSTRAINTS SUMMARY
-- =====================================================
-- 
-- user_roles -> users(id), roles(id)
-- password_reset_tokens -> users(id)
-- complaints -> users(id), complaint_status(id), users(id)
-- attachments -> complaints(id)
-- comments -> complaints(id), users(id)
-- escalations -> complaints(id), users(id), roles(id), users(id)
-- notifications -> users(id), complaints(id)
-- officer_requests -> users(id), users(id)
--
-- All foreign keys use appropriate CASCADE/SET NULL actions
-- to maintain data integrity while allowing safe deletions

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

SELECT 
    '========================================' as message
UNION ALL
SELECT 'RESOLVEIT DATABASE SCHEMA CREATED!' as message
UNION ALL
SELECT '========================================' as message
UNION ALL
SELECT '' as message
UNION ALL
SELECT 'Database: resolveit' as message
UNION ALL
SELECT 'Tables Created: 10' as message
UNION ALL
SELECT 'Master Data: Essential only' as message
UNION ALL
SELECT 'Sample Data: None' as message
UNION ALL
SELECT '' as message
UNION ALL
SELECT 'Ready for production deployment!' as message
UNION ALL
SELECT 'Create your first admin user via registration.' as message;

-- End of schema file
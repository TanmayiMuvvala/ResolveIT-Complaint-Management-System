package com.resolveit.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "escalations")
public class Escalation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne
    @JoinColumn(name = "escalated_to_role", nullable = false)
    private Role escalatedToRole;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @Column(name = "resolved")
    private Boolean resolved = false;

    @PrePersist
    protected void onCreate() {
        if (escalatedAt == null) {
            escalatedAt = LocalDateTime.now();
        }
    }

    // Constructors
    public Escalation() {}

    public Escalation(Long id, Complaint complaint, Role escalatedToRole, String reason, LocalDateTime escalatedAt, Boolean resolved) {
        this.id = id;
        this.complaint = complaint;
        this.escalatedToRole = escalatedToRole;
        this.reason = reason;
        this.escalatedAt = escalatedAt;
        this.resolved = resolved;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public Role getEscalatedToRole() {
        return escalatedToRole;
    }

    public void setEscalatedToRole(Role escalatedToRole) {
        this.escalatedToRole = escalatedToRole;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getEscalatedAt() {
        return escalatedAt;
    }

    public void setEscalatedAt(LocalDateTime escalatedAt) {
        this.escalatedAt = escalatedAt;
    }

    public Boolean getResolved() {
        return resolved;
    }

    public void setResolved(Boolean resolved) {
        this.resolved = resolved;
    }
}
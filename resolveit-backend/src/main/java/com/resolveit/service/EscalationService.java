package com.resolveit.service;

import com.resolveit.model.Comment;
import com.resolveit.model.Complaint;
import com.resolveit.model.ComplaintStatus;
import com.resolveit.model.Escalation;
import com.resolveit.model.Role;
import com.resolveit.model.User;
import com.resolveit.repository.CommentRepository;
import com.resolveit.repository.ComplaintRepository;
import com.resolveit.repository.ComplaintStatusRepository;
import com.resolveit.repository.EscalationRepository;
import com.resolveit.repository.RoleRepository;
import com.resolveit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EscalationService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EscalationRepository escalationRepository;

    @Autowired
    private ComplaintStatusRepository complaintStatusRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    // Escalation threshold in hours (configurable)
    private static final int ESCALATION_THRESHOLD_HOURS = 72; // 3 days

    /**
     * Automatically check and escalate unresolved complaints
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void autoEscalateUnresolvedComplaints() {
        LocalDateTime thresholdTime = LocalDateTime.now().minusHours(ESCALATION_THRESHOLD_HOURS);
        
        // Find complaints that are old and not resolved
        List<Complaint> unresolvedComplaints = complaintRepository
            .findByCreatedAtBeforeAndStatusCodeNot(thresholdTime, "RESOLVED");

        for (Complaint complaint : unresolvedComplaints) {
            // Check if already escalated
            if (!"ESCALATED".equals(complaint.getStatus().getCode())) {
                escalateComplaint(complaint, "Auto-escalated: Unresolved for more than " + ESCALATION_THRESHOLD_HOURS + " hours");
            }
        }
    }

    /**
     * Manually escalate a complaint with reason
     */
    @Transactional
    public Escalation escalateComplaint(Long complaintId, String reason, User escalatedBy) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Escalation reason is required");
        }
        
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        return escalateComplaint(complaint, reason, escalatedBy);
    }

    /**
     * Internal method to escalate a complaint
     */
    private Escalation escalateComplaint(Complaint complaint, String reason) {
        return escalateComplaint(complaint, reason, null);
    }
    
    private Escalation escalateComplaint(Complaint complaint, String reason, User escalatedBy) {
        // Get ROLE_ADMIN for escalation
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
            .orElseThrow(() -> new RuntimeException("Admin role not found"));

        // Create escalation record
        Escalation escalation = new Escalation();
        escalation.setComplaint(complaint);
        escalation.setEscalatedToRole(adminRole);
        escalation.setReason(reason);
        escalation.setEscalatedAt(LocalDateTime.now());
        escalation.setResolved(false);

        escalationRepository.save(escalation);

        // Update complaint status to ESCALATED
        ComplaintStatus escalatedStatus = complaintStatusRepository.findByCode("ESCALATED")
            .orElseThrow(() -> new RuntimeException("Escalated status not found"));
        complaint.setStatus(escalatedStatus);
        complaintRepository.save(complaint);

        // Add a comment to document the escalation
        addEscalationComment(complaint, escalation, escalatedBy);

        // Notify relevant parties with escalation details
        notifyEscalation(complaint, escalation, escalatedBy);

        return escalation;
    }

    /**
     * Notify users and admins about escalation with full details
     */
    private void notifyEscalation(Complaint complaint, Escalation escalation, User escalatedBy) {
        String escalatedByName = escalatedBy != null ? escalatedBy.getFullName() : "System (Auto-escalation)";
        String escalatedByEmail = escalatedBy != null ? escalatedBy.getEmail() : "system@resolveit.com";
        
        System.out.println("=== ESCALATION NOTIFICATION ===");
        System.out.println("Complaint ID: " + complaint.getId());
        System.out.println("Complaint Title: " + complaint.getTitle());
        System.out.println("Escalated By: " + escalatedByName);
        System.out.println("Reason: " + escalation.getReason());
        
        // Notify the complaint owner with full escalation details
        if (complaint.getUser() != null) {
            try {
                System.out.println("Sending escalation email to: " + complaint.getUser().getEmail());
                
                emailService.sendDetailedEscalationNotificationToUser(
                    complaint.getUser().getEmail(),
                    complaint.getUser().getFullName(),
                    complaint.getTitle(),
                    complaint.getId(),
                    escalation.getReason(),
                    escalatedByName,
                    escalatedByEmail,
                    escalation.getEscalatedAt()
                );
                
                System.out.println("✅ Escalation email sent successfully!");
                
                notificationService.createNotification(
                    complaint.getUser(),
                    "Complaint Escalated",
                    "Your complaint '" + complaint.getTitle() + "' has been escalated by " + escalatedByName + ". Reason: " + escalation.getReason(),
                    complaint.getId()
                );
            } catch (Exception e) {
                System.err.println("❌ Failed to notify user: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("⚠️ No user associated with complaint - skipping email");
        }

        // Notify all admins
        List<User> admins = userRepository.findByRolesName("ROLE_ADMIN");
        for (User admin : admins) {
            try {
                emailService.sendEscalationNotificationToAdmin(
                    admin.getEmail(),
                    admin.getFullName(),
                    complaint.getTitle(),
                    complaint.getId(),
                    escalation.getReason()
                );
                
                notificationService.createNotification(
                    admin,
                    "New Escalated Complaint",
                    "Complaint #" + complaint.getId() + " escalated by " + escalatedByName + " requires your attention.",
                    complaint.getId()
                );
            } catch (Exception e) {
                System.err.println("Failed to notify admin: " + e.getMessage());
            }
        }
    }

    /**
     * Resolve an escalation
     */
    @Transactional
    public void resolveEscalation(Long escalationId) {
        Escalation escalation = escalationRepository.findById(escalationId)
            .orElseThrow(() -> new RuntimeException("Escalation not found"));
        
        escalation.setResolved(true);
        escalationRepository.save(escalation);
    }

    /**
     * Get all escalations for a complaint
     */
    public List<Escalation> getEscalationsForComplaint(Long complaintId) {
        return escalationRepository.findByComplaintId(complaintId);
    }

    /**
     * Get all unresolved escalations
     */
    public List<Escalation> getUnresolvedEscalations() {
        return escalationRepository.findByResolvedFalse();
    }

    /**
     * Add a comment to document the escalation
     */
    private void addEscalationComment(Complaint complaint, Escalation escalation, User escalatedBy) {
        try {
            Comment escalationComment = new Comment();
            escalationComment.setComplaint(complaint);
            escalationComment.setAuthor(escalatedBy); // The person who escalated
            escalationComment.setIsPrivate(false); // Make it public so everyone can see
            escalationComment.setCreatedAt(LocalDateTime.now());
            
            // Create a detailed escalation message
            String escalatedByName = escalatedBy != null ? escalatedBy.getFullName() : "System";
            String message = String.format(
                "🚨 COMPLAINT ESCALATED\n\n" +
                "This complaint has been escalated to senior management for priority attention.\n\n" +
                "Escalated by: %s\n" +
                "Date: %s\n" +
                "Reason: %s\n\n" +
                "The complaint status has been changed to ESCALATED and relevant administrators have been notified.",
                escalatedByName,
                escalation.getEscalatedAt().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")),
                escalation.getReason()
            );
            
            escalationComment.setMessage(message);
            commentRepository.save(escalationComment);
            
            System.out.println("✅ Escalation comment added to complaint #" + complaint.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Failed to add escalation comment: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
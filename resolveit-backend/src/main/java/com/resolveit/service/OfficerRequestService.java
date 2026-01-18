package com.resolveit.service;

import com.resolveit.model.OfficerRequest;
import com.resolveit.model.Role;
import com.resolveit.model.User;
import com.resolveit.repository.OfficerRequestRepository;
import com.resolveit.repository.RoleRepository;
import com.resolveit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class OfficerRequestService {

    @Autowired
    private OfficerRequestRepository officerRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Submit a request to become an officer
     */
    @Transactional
    public OfficerRequest submitRequest(Long userId, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has a pending request
        if (officerRequestRepository.existsByUserIdAndStatus(userId, "PENDING")) {
            throw new RuntimeException("You already have a pending officer request");
        }

        // Check if user is already an officer
        boolean isOfficer = user.getRoles().stream()
            .anyMatch(role -> "ROLE_OFFICER".equals(role.getName()) || "ROLE_ADMIN".equals(role.getName()));
        
        if (isOfficer) {
            throw new RuntimeException("You are already an officer");
        }

        OfficerRequest request = new OfficerRequest();
        request.setUser(user);
        request.setReason(reason);
        request.setStatus("PENDING");
        
        officerRequestRepository.save(request);

        // Notify all super admins
        notifySuperAdmins(request);

        return request;
    }

    /**
     * Get all pending requests (for super admin)
     */
    public List<OfficerRequest> getPendingRequests() {
        return officerRequestRepository.findByStatusOrderByRequestedAtDesc("PENDING");
    }

    /**
     * Get user's requests
     */
    public List<OfficerRequest> getUserRequests(Long userId) {
        return officerRequestRepository.findByUserIdOrderByRequestedAtDesc(userId);
    }

    /**
     * Approve officer request
     */
    @Transactional
    public void approveRequest(Long requestId, Long adminId, String comment) {
        OfficerRequest request = officerRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));

        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Add ROLE_OFFICER to user
        Role officerRole = roleRepository.findByName("ROLE_OFFICER")
            .orElseThrow(() -> new RuntimeException("Officer role not found"));

        User user = request.getUser();
        Set<Role> roles = user.getRoles();
        roles.add(officerRole);
        user.setRoles(roles);
        userRepository.save(user);

        // Update request status
        request.setStatus("APPROVED");
        request.setReviewedBy(admin);
        request.setReviewComment(comment);
        request.setReviewedAt(LocalDateTime.now());
        officerRequestRepository.save(request);

        // Notify user
        try {
            emailService.sendOfficerRequestApprovalEmail(
                user.getEmail(),
                user.getFullName(),
                admin.getFullName()
            );
            
            notificationService.createNotification(
                user,
                "Officer Request Approved! 🎉",
                "Congratulations! Your request to become an officer has been approved by " + admin.getFullName(),
                null
            );
        } catch (Exception e) {
            System.err.println("Failed to notify user: " + e.getMessage());
        }
    }

    /**
     * Reject officer request
     */
    @Transactional
    public void rejectRequest(Long requestId, Long adminId, String comment) {
        OfficerRequest request = officerRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));

        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));

        request.setStatus("REJECTED");
        request.setReviewedBy(admin);
        request.setReviewComment(comment);
        request.setReviewedAt(LocalDateTime.now());
        officerRequestRepository.save(request);

        // Notify user
        try {
            emailService.sendOfficerRequestRejectionEmail(
                request.getUser().getEmail(),
                request.getUser().getFullName(),
                admin.getFullName(),
                comment
            );
            
            notificationService.createNotification(
                request.getUser(),
                "Officer Request Update",
                "Your officer request has been reviewed. Please check your email for details.",
                null
            );
        } catch (Exception e) {
            System.err.println("Failed to notify user: " + e.getMessage());
        }
    }

    /**
     * Notify super admins about new request
     */
    private void notifySuperAdmins(OfficerRequest request) {
        List<User> admins = userRepository.findByRolesName("ROLE_ADMIN");
        
        for (User admin : admins) {
            try {
                emailService.sendNewOfficerRequestNotification(
                    admin.getEmail(),
                    admin.getFullName(),
                    request.getUser().getFullName(),
                    request.getUser().getEmail(),
                    request.getReason()
                );
                
                notificationService.createNotification(
                    admin,
                    "New Officer Request",
                    request.getUser().getFullName() + " has requested to become an officer",
                    null
                );
            } catch (Exception e) {
                System.err.println("Failed to notify admin: " + e.getMessage());
            }
        }
    }
}

package com.resolveit.controller;

import com.resolveit.model.OfficerRequest;
import com.resolveit.model.User;
import com.resolveit.repository.UserRepository;
import com.resolveit.service.OfficerRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/officer-requests")
@CrossOrigin(origins = "*")
public class OfficerRequestController {

    @Autowired
    private OfficerRequestService officerRequestService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Submit officer request
     */
    @PostMapping
    public Map<String, Object> submitRequest(@RequestBody Map<String, String> payload, Authentication auth) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            String reason = payload.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Reason is required");
                return response;
            }

            OfficerRequest request = officerRequestService.submitRequest(user.getId(), reason);
            
            response.put("status", "success");
            response.put("message", "Officer request submitted successfully");
            response.put("request", request);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * Get user's requests
     */
    @GetMapping("/my-requests")
    public Map<String, Object> getMyRequests(Authentication auth) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<OfficerRequest> requests = officerRequestService.getUserRequests(user.getId());
            
            response.put("status", "success");
            response.put("requests", requests);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * Get all pending requests (Super Admin only)
     */
    @GetMapping("/pending")
    public Map<String, Object> getPendingRequests(Authentication auth) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<OfficerRequest> requests = officerRequestService.getPendingRequests();
            
            response.put("status", "success");
            response.put("requests", requests);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * Approve request (Super Admin only)
     */
    @PutMapping("/{id}/approve")
    public Map<String, Object> approveRequest(@PathVariable Long id, 
                                              @RequestBody Map<String, String> payload,
                                              Authentication auth) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = auth.getName();
            User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

            String comment = payload.get("comment");
            officerRequestService.approveRequest(id, admin.getId(), comment);
            
            response.put("status", "success");
            response.put("message", "Request approved successfully");
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        
        return response;
    }

    /**
     * Reject request (Super Admin only)
     */
    @PutMapping("/{id}/reject")
    public Map<String, Object> rejectRequest(@PathVariable Long id,
                                            @RequestBody Map<String, String> payload,
                                            Authentication auth) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = auth.getName();
            User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

            String comment = payload.get("comment");
            if (comment == null || comment.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Comment/reason is required for rejection");
                return response;
            }

            officerRequestService.rejectRequest(id, admin.getId(), comment);
            
            response.put("status", "success");
            response.put("message", "Request rejected");
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        
        return response;
    }
}

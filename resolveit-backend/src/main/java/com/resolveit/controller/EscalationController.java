package com.resolveit.controller;

import com.resolveit.model.Escalation;
import com.resolveit.model.User;
import com.resolveit.repository.UserRepository;
import com.resolveit.service.EscalationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/escalations")
@CrossOrigin(origins = "*")
public class EscalationController {

    @Autowired
    private EscalationService escalationService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Manually escalate a complaint
     * Only officers and admins can escalate
     */
    @PostMapping("/{complaintId}")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> escalateComplaint(
            @PathVariable Long complaintId,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Escalation reason is required");
                return ResponseEntity.badRequest().body(response);
            }
            String email = auth.getName();
            User escalatedBy = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            Escalation escalation = escalationService.escalateComplaint(complaintId, reason, escalatedBy);
            response.put("status", "success");
            response.put("message", "Complaint escalated successfully");
            response.put("escalation", escalation);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all escalations for a specific complaint
     */
    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<Map<String, Object>> getComplaintEscalations(@PathVariable Long complaintId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Escalation> escalations = escalationService.getEscalationsForComplaint(complaintId);
            
            response.put("status", "success");
            response.put("escalations", escalations);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all unresolved escalations
     * Only admins can view all unresolved escalations
     */
    @GetMapping("/unresolved")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUnresolvedEscalations() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Escalation> escalations = escalationService.getUnresolvedEscalations();
            
            response.put("status", "success");
            response.put("escalations", escalations);
            response.put("count", escalations.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Resolve an escalation
     * Only admins can resolve escalations
     */
    @PutMapping("/{escalationId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> resolveEscalation(@PathVariable Long escalationId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            escalationService.resolveEscalation(escalationId);
            
            response.put("status", "success");
            response.put("message", "Escalation resolved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
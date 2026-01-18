package com.resolveit.controller;

import com.resolveit.dto.CategoryReport;
import com.resolveit.dto.ComplaintTrendReport;
import com.resolveit.dto.StatusReport;
import com.resolveit.service.ReportService;
import com.resolveit.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private JwtService jwtService;

    /**
     * Get complaint trends by date range
     */
    @GetMapping("/trends")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getComplaintTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Default to last 30 days if not specified
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            ComplaintTrendReport report = reportService.getComplaintTrends(startDate, endDate);
            
            response.put("status", "success");
            response.put("report", report);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get category-wise report
     */
    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getCategoryReport() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<CategoryReport> reports = reportService.getCategoryReport();
            
            response.put("status", "success");
            response.put("reports", reports);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get status-wise report
     */
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatusReport() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<StatusReport> reports = reportService.getStatusReport();
            
            response.put("status", "success");
            response.put("reports", reports);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> stats = reportService.getDashboardStats();
            
            response.put("status", "success");
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Export complaints as CSV
     */
    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<String> exportCSV(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            // Default to last 30 days if not specified
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            String csv = reportService.generateCSVExport(startDate, endDate);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "complaints_report.csv");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(csv);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error generating CSV: " + e.getMessage());
        }
    }

    /**
     * Export complaints as PDF
     */
    @GetMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<byte[]> exportPDF(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            // Default to last 30 days if not specified
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            byte[] pdfBytes = reportService.generatePDFReport(startDate, endDate);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "complaints_report.pdf");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(("Error generating PDF: " + e.getMessage()).getBytes());
        }
    }

    // ==================== USER-SPECIFIC REPORT ENDPOINTS ====================

    /**
     * Get user-specific complaint trends by date range
     */
    @GetMapping("/my/trends")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getMyComplaintTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestHeader("Authorization") String token) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Default to last 30 days if not specified
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            String userEmail = jwtService.extractUsername(token.substring(7));
            ComplaintTrendReport report = reportService.getUserComplaintTrends(userEmail, startDate, endDate);
            
            response.put("status", "success");
            response.put("report", report);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get user-specific category-wise report
     */
    @GetMapping("/my/categories")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getMyCategoryReport(@RequestHeader("Authorization") String token) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userEmail = jwtService.extractUsername(token.substring(7));
            List<CategoryReport> reports = reportService.getUserCategoryReport(userEmail);
            
            response.put("status", "success");
            response.put("reports", reports);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get user-specific status-wise report
     */
    @GetMapping("/my/status")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getMyStatusReport(@RequestHeader("Authorization") String token) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userEmail = jwtService.extractUsername(token.substring(7));
            List<StatusReport> reports = reportService.getUserStatusReport(userEmail);
            
            response.put("status", "success");
            response.put("reports", reports);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get user-specific dashboard statistics
     */
    @GetMapping("/my/dashboard")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getMyDashboardStats(@RequestHeader("Authorization") String token) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userEmail = jwtService.extractUsername(token.substring(7));
            Map<String, Object> stats = reportService.getUserDashboardStats(userEmail);
            
            response.put("status", "success");
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Export user-specific complaints as CSV
     */
    @GetMapping("/my/export/csv")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<String> exportMyCSV(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Default to last 30 days if not specified
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            String userEmail = jwtService.extractUsername(token.substring(7));
            String csv = reportService.generateUserCSVExport(userEmail, startDate, endDate);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "my_complaints_report.csv");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(csv);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error generating CSV: " + e.getMessage());
        }
    }

    /**
     * Export user-specific complaints as PDF
     */
    @GetMapping("/my/export/pdf")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<byte[]> exportMyPDF(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Default to last 30 days if not specified
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            String userEmail = jwtService.extractUsername(token.substring(7));
            byte[] pdfBytes = reportService.generateUserPDFReport(userEmail, startDate, endDate);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "my_complaints_report.pdf");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(("Error generating PDF: " + e.getMessage()).getBytes());
        }
    }
}
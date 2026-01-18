package com.resolveit.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.resolveit.dto.ComplaintTrendReport;
import com.resolveit.dto.CategoryReport;
import com.resolveit.dto.StatusReport;
import com.resolveit.model.Complaint;
import com.resolveit.model.User;
import com.resolveit.repository.ComplaintRepository;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    /**
     * Get complaint trends by date range
     */
    public ComplaintTrendReport getComplaintTrends(LocalDateTime startDate, LocalDateTime endDate) {
        List<Complaint> complaints = complaintRepository.findByCreatedAtBetween(startDate, endDate);
        
        ComplaintTrendReport report = new ComplaintTrendReport();
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setTotalComplaints(complaints.size());
        
        // Group by status
        Map<String, Long> byStatus = complaints.stream()
            .collect(Collectors.groupingBy(
                c -> c.getStatus().getDisplay(),
                Collectors.counting()
            ));
        report.setComplaintsByStatus(byStatus);
        
        // Group by category
        Map<String, Long> byCategory = complaints.stream()
            .filter(c -> c.getCategory() != null)
            .collect(Collectors.groupingBy(
                Complaint::getCategory,
                Collectors.counting()
            ));
        report.setComplaintsByCategory(byCategory);
        
        // Group by priority
        Map<String, Long> byPriority = complaints.stream()
            .collect(Collectors.groupingBy(
                c -> c.getPriority().toString(),
                Collectors.counting()
            ));
        report.setComplaintsByPriority(byPriority);
        
        // Daily trend
        Map<String, Long> dailyTrend = complaints.stream()
            .collect(Collectors.groupingBy(
                c -> c.getCreatedAt().toLocalDate().toString(),
                Collectors.counting()
            ));
        report.setDailyTrend(dailyTrend);
        
        return report;
    }

    /**
     * Get category-wise report
     */
    public List<CategoryReport> getCategoryReport() {
        List<Complaint> allComplaints = complaintRepository.findAll();
        
        Map<String, List<Complaint>> byCategory = allComplaints.stream()
            .filter(c -> c.getCategory() != null)
            .collect(Collectors.groupingBy(Complaint::getCategory));
        
        List<CategoryReport> reports = new ArrayList<>();
        for (Map.Entry<String, List<Complaint>> entry : byCategory.entrySet()) {
            CategoryReport report = new CategoryReport();
            report.setCategory(entry.getKey());
            report.setTotalCount(entry.getValue().size());
            
            long resolved = entry.getValue().stream()
                .filter(c -> "RESOLVED".equals(c.getStatus().getCode()))
                .count();
            report.setResolvedCount(resolved);
            report.setPendingCount(entry.getValue().size() - resolved);
            
            double avgResolutionTime = calculateAverageResolutionTime(entry.getValue());
            report.setAverageResolutionTimeHours(avgResolutionTime);
            
            reports.add(report);
        }
        
        return reports;
    }

    /**
     * Get status-wise report
     */
    public List<StatusReport> getStatusReport() {
        List<Complaint> allComplaints = complaintRepository.findAll();
        
        Map<String, List<Complaint>> byStatus = allComplaints.stream()
            .collect(Collectors.groupingBy(c -> c.getStatus().getDisplay()));
        
        List<StatusReport> reports = new ArrayList<>();
        for (Map.Entry<String, List<Complaint>> entry : byStatus.entrySet()) {
            StatusReport report = new StatusReport();
            report.setStatus(entry.getKey());
            report.setCount(entry.getValue().size());
            
            double percentage = (entry.getValue().size() * 100.0) / allComplaints.size();
            report.setPercentage(Math.round(percentage * 100.0) / 100.0);
            
            reports.add(report);
        }
        
        return reports;
    }

    /**
     * Generate CSV export data
     */
    public String generateCSVExport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Complaint> complaints = complaintRepository.findByCreatedAtBetween(startDate, endDate);
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Title,Category,Priority,Status,Created Date,Resolved Date,User,Officer\n");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (Complaint complaint : complaints) {
            csv.append(complaint.getId()).append(",");
            csv.append("\"").append(escapeCSV(complaint.getTitle())).append("\",");
            csv.append("\"").append(escapeCSV(complaint.getCategory())).append("\",");
            csv.append(complaint.getPriority()).append(",");
            csv.append(complaint.getStatus().getDisplay()).append(",");
            csv.append(complaint.getCreatedAt().format(formatter)).append(",");
            csv.append(complaint.getUpdatedAt().format(formatter)).append(",");
            csv.append(complaint.getUser() != null ? complaint.getUser().getFullName() : "Anonymous").append(",");
            csv.append(complaint.getAssignedOfficer() != null ? complaint.getAssignedOfficer().getFullName() : "Unassigned");
            csv.append("\n");
        }
        
        return csv.toString();
    }

    /**
     * Get dashboard statistics
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Complaint> allComplaints = complaintRepository.findAll();
        stats.put("totalComplaints", allComplaints.size());
        
        long resolved = allComplaints.stream()
            .filter(c -> "RESOLVED".equals(c.getStatus().getCode()))
            .count();
        stats.put("resolvedComplaints", resolved);
        
        long pending = allComplaints.stream()
            .filter(c -> !"RESOLVED".equals(c.getStatus().getCode()))
            .count();
        stats.put("pendingComplaints", pending);
        
        long escalated = allComplaints.stream()
            .filter(c -> "ESCALATED".equals(c.getStatus().getCode()))
            .count();
        stats.put("escalatedComplaints", escalated);
        
        // Recent complaints (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long recentComplaints = allComplaints.stream()
            .filter(c -> c.getCreatedAt().isAfter(weekAgo))
            .count();
        stats.put("recentComplaints", recentComplaints);
        
        // Average resolution time
        double avgResolutionTime = calculateAverageResolutionTime(allComplaints);
        stats.put("averageResolutionTimeHours", Math.round(avgResolutionTime * 100.0) / 100.0);
        
        return stats;
    }

    /**
     * Calculate average resolution time in hours
     */
    private double calculateAverageResolutionTime(List<Complaint> complaints) {
        List<Complaint> resolvedComplaints = complaints.stream()
            .filter(c -> "RESOLVED".equals(c.getStatus().getCode()))
            .collect(Collectors.toList());
        
        if (resolvedComplaints.isEmpty()) {
            return 0.0;
        }
        
        double totalHours = resolvedComplaints.stream()
            .mapToDouble(c -> {
                long seconds = java.time.Duration.between(c.getCreatedAt(), c.getUpdatedAt()).getSeconds();
                return seconds / 3600.0; // Convert to hours
            })
            .sum();
        
        return totalHours / resolvedComplaints.size();
    }

    /**
     * Escape CSV special characters
     */
    private String escapeCSV(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }

    // ==================== USER-SPECIFIC REPORTS ====================

    /**
     * Get user-specific complaint trends by date range
     */
    public ComplaintTrendReport getUserComplaintTrends(String userEmail, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Complaint> complaints = complaintRepository.findByAssignedOfficerAndCreatedAtBetween(user, startDate, endDate);
        
        ComplaintTrendReport report = new ComplaintTrendReport();
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setTotalComplaints(complaints.size());
        
        // Group by status
        Map<String, Long> byStatus = complaints.stream()
            .collect(Collectors.groupingBy(
                c -> c.getStatus().getDisplay(),
                Collectors.counting()
            ));
        report.setComplaintsByStatus(byStatus);
        
        // Group by category
        Map<String, Long> byCategory = complaints.stream()
            .filter(c -> c.getCategory() != null)
            .collect(Collectors.groupingBy(
                Complaint::getCategory,
                Collectors.counting()
            ));
        report.setComplaintsByCategory(byCategory);
        
        // Group by priority
        Map<String, Long> byPriority = complaints.stream()
            .collect(Collectors.groupingBy(
                c -> c.getPriority().toString(),
                Collectors.counting()
            ));
        report.setComplaintsByPriority(byPriority);
        
        // Daily trend
        Map<String, Long> dailyTrend = complaints.stream()
            .collect(Collectors.groupingBy(
                c -> c.getCreatedAt().toLocalDate().toString(),
                Collectors.counting()
            ));
        report.setDailyTrend(dailyTrend);
        
        return report;
    }

    /**
     * Get user-specific category-wise report
     */
    public List<CategoryReport> getUserCategoryReport(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Complaint> userComplaints = complaintRepository.findByAssignedOfficer(user);
        
        Map<String, List<Complaint>> byCategory = userComplaints.stream()
            .filter(c -> c.getCategory() != null)
            .collect(Collectors.groupingBy(Complaint::getCategory));
        
        List<CategoryReport> reports = new ArrayList<>();
        for (Map.Entry<String, List<Complaint>> entry : byCategory.entrySet()) {
            CategoryReport report = new CategoryReport();
            report.setCategory(entry.getKey());
            report.setTotalCount(entry.getValue().size());
            
            long resolved = entry.getValue().stream()
                .filter(c -> "RESOLVED".equals(c.getStatus().getCode()))
                .count();
            report.setResolvedCount(resolved);
            report.setPendingCount(entry.getValue().size() - resolved);
            
            double avgResolutionTime = calculateAverageResolutionTime(entry.getValue());
            report.setAverageResolutionTimeHours(avgResolutionTime);
            
            reports.add(report);
        }
        
        return reports;
    }

    /**
     * Get user-specific status-wise report
     */
    public List<StatusReport> getUserStatusReport(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Complaint> userComplaints = complaintRepository.findByAssignedOfficer(user);
        
        Map<String, List<Complaint>> byStatus = userComplaints.stream()
            .collect(Collectors.groupingBy(c -> c.getStatus().getDisplay()));
        
        List<StatusReport> reports = new ArrayList<>();
        for (Map.Entry<String, List<Complaint>> entry : byStatus.entrySet()) {
            StatusReport report = new StatusReport();
            report.setStatus(entry.getKey());
            report.setCount(entry.getValue().size());
            
            double percentage = userComplaints.isEmpty() ? 0.0 : 
                (entry.getValue().size() * 100.0) / userComplaints.size();
            report.setPercentage(Math.round(percentage * 100.0) / 100.0);
            
            reports.add(report);
        }
        
        return reports;
    }

    /**
     * Get user-specific dashboard statistics
     */
    public Map<String, Object> getUserDashboardStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> stats = new HashMap<>();
        
        List<Complaint> userComplaints = complaintRepository.findByAssignedOfficer(user);
        stats.put("totalComplaints", userComplaints.size());
        
        long resolved = userComplaints.stream()
            .filter(c -> "RESOLVED".equals(c.getStatus().getCode()))
            .count();
        stats.put("resolvedComplaints", resolved);
        
        long pending = userComplaints.stream()
            .filter(c -> !"RESOLVED".equals(c.getStatus().getCode()))
            .count();
        stats.put("pendingComplaints", pending);
        
        long escalated = userComplaints.stream()
            .filter(c -> "ESCALATED".equals(c.getStatus().getCode()))
            .count();
        stats.put("escalatedComplaints", escalated);
        
        // Recent complaints (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long recentComplaints = userComplaints.stream()
            .filter(c -> c.getCreatedAt().isAfter(weekAgo))
            .count();
        stats.put("recentComplaints", recentComplaints);
        
        // Average resolution time for this user
        double avgResolutionTime = calculateAverageResolutionTime(userComplaints);
        stats.put("averageResolutionTimeHours", Math.round(avgResolutionTime * 100.0) / 100.0);
        
        // Performance metrics
        double resolutionRate = userComplaints.isEmpty() ? 0.0 : (resolved * 100.0) / userComplaints.size();
        stats.put("resolutionRate", Math.round(resolutionRate * 100.0) / 100.0);
        
        return stats;
    }

    /**
     * Generate user-specific CSV export data
     */
    public String generateUserCSVExport(String userEmail, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Complaint> complaints = complaintRepository.findByAssignedOfficerAndCreatedAtBetween(user, startDate, endDate);
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Title,Category,Priority,Status,Created Date,Resolved Date,User,Officer\n");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (Complaint complaint : complaints) {
            csv.append(complaint.getId()).append(",");
            csv.append("\"").append(escapeCSV(complaint.getTitle())).append("\",");
            csv.append("\"").append(escapeCSV(complaint.getCategory())).append("\",");
            csv.append(complaint.getPriority()).append(",");
            csv.append(complaint.getStatus().getDisplay()).append(",");
            csv.append(complaint.getCreatedAt().format(formatter)).append(",");
            csv.append(complaint.getUpdatedAt().format(formatter)).append(",");
            csv.append(complaint.getUser() != null ? complaint.getUser().getFullName() : "Anonymous").append(",");
            csv.append(complaint.getAssignedOfficer() != null ? complaint.getAssignedOfficer().getFullName() : "Unassigned");
            csv.append("\n");
        }
        
        return csv.toString();
    }

    /**
     * Helper method to extract user email from JWT token
     */
    private String extractUserEmailFromToken(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtService.extractUsername(token);
    }

    // ==================== PDF GENERATION METHODS ====================

    /**
     * Generate PDF report for system-wide data
     */
    public byte[] generatePDFReport(LocalDateTime startDate, LocalDateTime endDate) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("ResolveIt - Complaints Report")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")))
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Report Period: " + 
                startDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) + " to " +
                endDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Get data
            List<Complaint> complaints = complaintRepository.findByCreatedAtBetween(startDate, endDate);
            
            // Summary Statistics
            document.add(new Paragraph("Summary Statistics").setFontSize(16).setBold());
            
            Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
            summaryTable.setWidth(UnitValue.createPercentValue(100));
            
            summaryTable.addCell(new Cell().add(new Paragraph("Total Complaints")).setBold());
            summaryTable.addCell(new Cell().add(new Paragraph(String.valueOf(complaints.size()))));
            
            long resolved = complaints.stream().filter(c -> "RESOLVED".equals(c.getStatus().getCode())).count();
            summaryTable.addCell(new Cell().add(new Paragraph("Resolved")).setBold());
            summaryTable.addCell(new Cell().add(new Paragraph(String.valueOf(resolved))));
            
            long pending = complaints.size() - resolved;
            summaryTable.addCell(new Cell().add(new Paragraph("Pending")).setBold());
            summaryTable.addCell(new Cell().add(new Paragraph(String.valueOf(pending))));
            
            document.add(summaryTable);
            document.add(new Paragraph("\n"));

            // Complaints Details Table
            document.add(new Paragraph("Complaints Details").setFontSize(16).setBold());
            
            Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 3, 2, 1, 2, 2}));
            detailsTable.setWidth(UnitValue.createPercentValue(100));
            
            // Headers
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("ID")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Title")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Category")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Priority")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Status")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Created")).setBold());
            
            // Data rows
            for (Complaint complaint : complaints) {
                detailsTable.addCell(new Cell().add(new Paragraph(String.valueOf(complaint.getId()))));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getTitle())));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getCategory() != null ? complaint.getCategory() : "N/A")));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getPriority().toString())));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getStatus().getDisplay())));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))));
            }
            
            document.add(detailsTable);
            document.close();
            
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage());
        }
    }

    /**
     * Generate PDF report for user-specific data
     */
    public byte[] generateUserPDFReport(String userEmail, LocalDateTime startDate, LocalDateTime endDate) {
        try {
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("ResolveIt - Personal Complaints Report")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Officer: " + user.getFullName())
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")))
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Report Period: " + 
                startDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) + " to " +
                endDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Get user-specific data
            List<Complaint> complaints = complaintRepository.findByAssignedOfficerAndCreatedAtBetween(user, startDate, endDate);
            
            // Personal Statistics
            document.add(new Paragraph("Personal Performance Statistics").setFontSize(16).setBold());
            
            Table statsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
            statsTable.setWidth(UnitValue.createPercentValue(100));
            
            statsTable.addCell(new Cell().add(new Paragraph("Total Assigned Complaints")).setBold());
            statsTable.addCell(new Cell().add(new Paragraph(String.valueOf(complaints.size()))));
            
            long resolved = complaints.stream().filter(c -> "RESOLVED".equals(c.getStatus().getCode())).count();
            statsTable.addCell(new Cell().add(new Paragraph("Resolved")).setBold());
            statsTable.addCell(new Cell().add(new Paragraph(String.valueOf(resolved))));
            
            long pending = complaints.size() - resolved;
            statsTable.addCell(new Cell().add(new Paragraph("Pending")).setBold());
            statsTable.addCell(new Cell().add(new Paragraph(String.valueOf(pending))));
            
            double resolutionRate = complaints.isEmpty() ? 0.0 : (resolved * 100.0) / complaints.size();
            statsTable.addCell(new Cell().add(new Paragraph("Resolution Rate")).setBold());
            statsTable.addCell(new Cell().add(new Paragraph(String.format("%.1f%%", resolutionRate))));
            
            document.add(statsTable);
            document.add(new Paragraph("\n"));

            // Assigned Complaints Details
            document.add(new Paragraph("Assigned Complaints Details").setFontSize(16).setBold());
            
            Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 3, 2, 1, 2, 2}));
            detailsTable.setWidth(UnitValue.createPercentValue(100));
            
            // Headers
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("ID")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Title")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Category")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Priority")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Status")).setBold());
            detailsTable.addHeaderCell(new Cell().add(new Paragraph("Created")).setBold());
            
            // Data rows
            for (Complaint complaint : complaints) {
                detailsTable.addCell(new Cell().add(new Paragraph(String.valueOf(complaint.getId()))));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getTitle())));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getCategory() != null ? complaint.getCategory() : "N/A")));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getPriority().toString())));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getStatus().getDisplay())));
                detailsTable.addCell(new Cell().add(new Paragraph(complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))));
            }
            
            document.add(detailsTable);
            document.close();
            
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate user PDF report: " + e.getMessage());
        }
    }
}
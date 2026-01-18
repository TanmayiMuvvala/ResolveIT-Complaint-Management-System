package com.resolveit.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ComplaintTrendReport {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int totalComplaints;
    private Map<String, Long> complaintsByStatus;
    private Map<String, Long> complaintsByCategory;
    private Map<String, Long> complaintsByPriority;
    private Map<String, Long> dailyTrend;

    // Constructors
    public ComplaintTrendReport() {}

    public ComplaintTrendReport(LocalDateTime startDate, LocalDateTime endDate, int totalComplaints, 
                               Map<String, Long> complaintsByStatus, Map<String, Long> complaintsByCategory, 
                               Map<String, Long> complaintsByPriority, Map<String, Long> dailyTrend) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalComplaints = totalComplaints;
        this.complaintsByStatus = complaintsByStatus;
        this.complaintsByCategory = complaintsByCategory;
        this.complaintsByPriority = complaintsByPriority;
        this.dailyTrend = dailyTrend;
    }

    // Getters and Setters
    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public int getTotalComplaints() {
        return totalComplaints;
    }

    public void setTotalComplaints(int totalComplaints) {
        this.totalComplaints = totalComplaints;
    }

    public Map<String, Long> getComplaintsByStatus() {
        return complaintsByStatus;
    }

    public void setComplaintsByStatus(Map<String, Long> complaintsByStatus) {
        this.complaintsByStatus = complaintsByStatus;
    }

    public Map<String, Long> getComplaintsByCategory() {
        return complaintsByCategory;
    }

    public void setComplaintsByCategory(Map<String, Long> complaintsByCategory) {
        this.complaintsByCategory = complaintsByCategory;
    }

    public Map<String, Long> getComplaintsByPriority() {
        return complaintsByPriority;
    }

    public void setComplaintsByPriority(Map<String, Long> complaintsByPriority) {
        this.complaintsByPriority = complaintsByPriority;
    }

    public Map<String, Long> getDailyTrend() {
        return dailyTrend;
    }

    public void setDailyTrend(Map<String, Long> dailyTrend) {
        this.dailyTrend = dailyTrend;
    }
}
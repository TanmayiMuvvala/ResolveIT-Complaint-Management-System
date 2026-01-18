package com.resolveit.dto;

public class CategoryReport {
    private String category;
    private long totalCount;
    private long resolvedCount;
    private long pendingCount;
    private double averageResolutionTimeHours;

    // Constructors
    public CategoryReport() {}

    public CategoryReport(String category, long totalCount, long resolvedCount, long pendingCount, double averageResolutionTimeHours) {
        this.category = category;
        this.totalCount = totalCount;
        this.resolvedCount = resolvedCount;
        this.pendingCount = pendingCount;
        this.averageResolutionTimeHours = averageResolutionTimeHours;
    }

    // Getters and Setters
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public long getResolvedCount() {
        return resolvedCount;
    }

    public void setResolvedCount(long resolvedCount) {
        this.resolvedCount = resolvedCount;
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public double getAverageResolutionTimeHours() {
        return averageResolutionTimeHours;
    }

    public void setAverageResolutionTimeHours(double averageResolutionTimeHours) {
        this.averageResolutionTimeHours = averageResolutionTimeHours;
    }
}
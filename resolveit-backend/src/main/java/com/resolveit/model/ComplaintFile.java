package com.resolveit.model;

import jakarta.persistence.*;

@Entity
@Table(name = "complaint_files")
public class ComplaintFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String filePath;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    // Constructors
    public ComplaintFile() {}

    public ComplaintFile(Long id, String fileName, String filePath, Complaint complaint) {
        this.id = id;
        this.fileName = fileName;
        this.filePath = filePath;
        this.complaint = complaint;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }
}

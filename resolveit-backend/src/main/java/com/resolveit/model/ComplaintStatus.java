package com.resolveit.model;

import jakarta.persistence.*;

@Entity
@Table(name = "complaint_status")
public class ComplaintStatus {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(unique = true)
    private String code;
    
    private String display;

    // Constructors
    public ComplaintStatus() {}

    public ComplaintStatus(Integer id, String code, String display) {
        this.id = id;
        this.code = code;
        this.display = display;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDisplay() {
        return display;
    }

    public void setDisplay(String display) {
        this.display = display;
    }
}

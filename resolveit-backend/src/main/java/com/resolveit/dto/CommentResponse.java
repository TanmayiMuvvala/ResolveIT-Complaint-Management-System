package com.resolveit.dto;

import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private String message;
    private boolean isPrivate;
    private UserResponse author;
    private LocalDateTime createdAt;

    // Constructors
    public CommentResponse() {}

    public CommentResponse(Long id, String message, boolean isPrivate, UserResponse author, LocalDateTime createdAt) {
        this.id = id;
        this.message = message;
        this.isPrivate = isPrivate;
        this.author = author;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public UserResponse getAuthor() {
        return author;
    }

    public void setAuthor(UserResponse author) {
        this.author = author;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
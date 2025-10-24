package com.example.kanban.dto;

import com.example.kanban.domain.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO de atualização de Task (entrada). */
public class TaskUpdateRequest {
    @NotBlank
    @Size(max = 140)
    private String title;

    @Size(max = 2000)
    private String description;

    private TaskStatus status;

    private Long userId; // opcional

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}


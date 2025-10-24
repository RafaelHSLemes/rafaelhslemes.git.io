package com.example.kanban.web.payload;

import com.example.kanban.domain.TaskStatus;

public class StatusUpdateRequest {
    private TaskStatus status;

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
}


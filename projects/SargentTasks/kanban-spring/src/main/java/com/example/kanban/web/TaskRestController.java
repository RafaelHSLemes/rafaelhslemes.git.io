package com.example.kanban.web;

import com.example.kanban.domain.TaskStatus;
import com.example.kanban.dto.TaskCreateRequest;
import com.example.kanban.dto.TaskDto;
import com.example.kanban.dto.TaskUpdateRequest;
import com.example.kanban.web.payload.StatusUpdateRequest;
import com.example.kanban.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskRestController {
    private final TaskService service;

    public TaskRestController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    public Page<TaskDto> list(
            @RequestParam(value = "status", required = false) TaskStatus status,
            @RequestParam(value = "title", required = false) String title,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        return service.list(status, title, pageable);
    }

    @GetMapping("/{id}")
    public TaskDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskDto create(@Valid @RequestBody TaskCreateRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public TaskDto update(@PathVariable Long id, @Valid @RequestBody TaskUpdateRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PatchMapping("/{id}/status")
    public TaskDto updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        TaskUpdateRequest req = new TaskUpdateRequest();
        req.setStatus(request.getStatus());
        return service.update(id, req);
    }
}

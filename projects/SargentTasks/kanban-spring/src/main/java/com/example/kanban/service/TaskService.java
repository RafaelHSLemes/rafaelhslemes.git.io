package com.example.kanban.service;

import com.example.kanban.domain.Task;
import com.example.kanban.domain.TaskStatus;
import com.example.kanban.dto.TaskCreateRequest;
import com.example.kanban.dto.TaskDto;
import com.example.kanban.dto.TaskUpdateRequest;
import com.example.kanban.mapper.TaskMapper;
import com.example.kanban.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

/**
 * Camada de negócio. Centraliza regras de CRUD, filtros e validações de domínio.
 */
@Service
public class TaskService {
    private final TaskRepository repository;
    private final TaskMapper mapper;

    public TaskService(TaskRepository repository, TaskMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> list(TaskStatus status, String title, Pageable pageable) {
        Page<Task> page = repository.search(status, (title == null || title.isBlank()) ? null : title, pageable);
        return page.map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public TaskDto get(Long id) {
        Task task = repository.findById(id).orElseThrow(() -> new NoSuchElementException("Task not found: " + id));
        return mapper.toDto(task);
    }

    @Transactional
    public TaskDto create(TaskCreateRequest request) {
        Task entity = mapper.toEntity(request);
        // default status se não informado
        if (entity.getStatus() == null) {
            entity.setStatus(TaskStatus.TODO);
        }
        Task saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Transactional
    public TaskDto update(Long id, TaskUpdateRequest request) {
        Task entity = repository.findById(id).orElseThrow(() -> new NoSuchElementException("Task not found: " + id));
        mapper.updateEntityFromDto(request, entity);
        Task saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NoSuchElementException("Task not found: " + id);
        }
        repository.deleteById(id);
    }
}


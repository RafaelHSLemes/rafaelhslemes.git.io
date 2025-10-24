package com.example.kanban.service;

import com.example.kanban.domain.Task;
import com.example.kanban.domain.TaskStatus;
import com.example.kanban.dto.TaskCreateRequest;
import com.example.kanban.dto.TaskDto;
import com.example.kanban.dto.TaskUpdateRequest;
import com.example.kanban.mapper.TaskMapper;
import com.example.kanban.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskServiceTest {
    TaskRepository repository;
    TaskMapper mapper;
    TaskService service;

    @BeforeEach
    void setUp() {
        repository = mock(TaskRepository.class);
        mapper = mock(TaskMapper.class);
        service = new TaskService(repository, mapper);
    }

    @Test
    void list_withStatusAndTitle_returnsPage() {
        Task t = new Task();
        t.setId(1L); t.setTitle("A"); t.setStatus(TaskStatus.TODO);
        when(repository.search(eq(TaskStatus.TODO), eq("A"), any())).thenReturn(new PageImpl<>(List.of(t)));
        TaskDto dto = new TaskDto(); dto.setId(1L); dto.setTitle("A"); dto.setStatus(TaskStatus.TODO);
        when(mapper.toDto(t)).thenReturn(dto);

        Page<TaskDto> page = service.list(TaskStatus.TODO, "A", PageRequest.of(0, 10));
        assertEquals(1, page.getTotalElements());
        assertEquals("A", page.getContent().get(0).getTitle());
    }

    @Test
    void get_whenMissing_throws() {
        when(repository.findById(9L)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> service.get(9L));
    }

    @Test
    void create_setsDefaultStatus_whenNull() {
        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle("New");
        Task entity = new Task(); entity.setTitle("New"); entity.setStatus(null);
        when(mapper.toEntity(req)).thenReturn(entity);
        Task saved = new Task(); saved.setId(2L); saved.setTitle("New"); saved.setStatus(TaskStatus.TODO);
        when(repository.save(any(Task.class))).thenReturn(saved);
        TaskDto dto = new TaskDto(); dto.setId(2L); dto.setTitle("New"); dto.setStatus(TaskStatus.TODO);
        when(mapper.toDto(saved)).thenReturn(dto);

        TaskDto out = service.create(req);
        assertEquals(TaskStatus.TODO, out.getStatus());

        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(repository).save(captor.capture());
        assertEquals(TaskStatus.TODO, captor.getValue().getStatus());
    }

    @Test
    void update_whenNotFound_throws() {
        when(repository.findById(5L)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> service.update(5L, new TaskUpdateRequest()));
    }

    @Test
    void delete_whenNotFound_throws() {
        when(repository.existsById(7L)).thenReturn(false);
        assertThrows(NoSuchElementException.class, () -> service.delete(7L));
    }
}


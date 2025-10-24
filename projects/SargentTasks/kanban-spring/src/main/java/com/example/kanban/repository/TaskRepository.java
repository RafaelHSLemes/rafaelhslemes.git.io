package com.example.kanban.repository;

import com.example.kanban.domain.Task;
import com.example.kanban.domain.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByStatus(TaskStatus status, Pageable pageable);

    @Query("select t from Task t where (:status is null or t.status = :status) and (:title is null or lower(t.title) like lower(concat('%', :title, '%')))")
    Page<Task> search(@Param("status") TaskStatus status, @Param("title") String title, Pageable pageable);
}


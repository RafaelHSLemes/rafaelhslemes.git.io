package com.example.kanban.mapper;

import com.example.kanban.domain.Task;
import com.example.kanban.dto.TaskCreateRequest;
import com.example.kanban.dto.TaskDto;
import com.example.kanban.dto.TaskUpdateRequest;
import org.mapstruct.*;

/**
 * Mapper entre Entidade e DTOs usando MapStruct.
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TaskMapper {

    TaskDto toDto(Task entity);

    Task toEntity(TaskCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(TaskUpdateRequest request, @MappingTarget Task entity);
}


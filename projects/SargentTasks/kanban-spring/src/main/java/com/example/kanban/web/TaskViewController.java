package com.example.kanban.web;

import com.example.kanban.domain.TaskStatus;
import com.example.kanban.dto.TaskCreateRequest;
import com.example.kanban.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/tasks")
public class TaskViewController {
    private final TaskService service;

    public TaskViewController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    public String board(Model model) {
        model.addAttribute("todo", service.list(TaskStatus.TODO, null, PageRequest.of(0, 100)).getContent());
        model.addAttribute("doing", service.list(TaskStatus.DOING, null, PageRequest.of(0, 100)).getContent());
        model.addAttribute("done", service.list(TaskStatus.DONE, null, PageRequest.of(0, 100)).getContent());
        model.addAttribute("form", new TaskCreateRequest());
        return "board";
    }

    @PostMapping
    public String create(@Valid @ModelAttribute("form") TaskCreateRequest form, BindingResult result, Model model) {
        if (result.hasErrors()) {
            return board(model);
        }
        service.create(form);
        return "redirect:/tasks";
    }
}


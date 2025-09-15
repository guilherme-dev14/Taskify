package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TaskDependencyDto.*;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.service.TaskDependencyService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task-dependencies")
@SecurityRequirement(name = "bearerAuth")
public class TaskDependencyController {

    @Autowired
    private TaskDependencyService taskDependencyService;

    @PostMapping
    public ResponseEntity<TaskDependencyResponseDTO> createTaskDependency(@Valid @RequestBody CreateTaskDependencyDTO createDTO) {
        try {
            TaskDependencyResponseDTO dependency = taskDependencyService.createTaskDependency(createDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(dependency);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/task/{taskId}/dependencies")
    public ResponseEntity<List<TaskDependencyResponseDTO>> getTaskDependencies(@PathVariable Long taskId) {
        try {
            List<TaskDependencyResponseDTO> dependencies = taskDependencyService.getTaskDependencies(taskId);
            return ResponseEntity.ok(dependencies);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/task/{taskId}/dependent-tasks")
    public ResponseEntity<List<TaskDependencyResponseDTO>> getTasksDependingOn(@PathVariable Long taskId) {
        try {
            List<TaskDependencyResponseDTO> dependentTasks = taskDependencyService.getTasksDependingOn(taskId);
            return ResponseEntity.ok(dependentTasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{dependencyId}")
    public ResponseEntity<Void> removeTaskDependency(@PathVariable Long dependencyId) {
        try {
            taskDependencyService.removeTaskDependency(dependencyId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/task/{taskId}/can-start")
    public ResponseEntity<Boolean> canStartTask(@PathVariable Long taskId) {
        try {
            boolean canStart = taskDependencyService.canStartTask(taskId);
            return ResponseEntity.ok(canStart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/task/{taskId}/blocking-tasks")
    public ResponseEntity<List<Task>> getBlockingTasks(@PathVariable Long taskId) {
        try {
            List<Task> blockingTasks = taskDependencyService.getBlockingTasks(taskId);
            return ResponseEntity.ok(blockingTasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
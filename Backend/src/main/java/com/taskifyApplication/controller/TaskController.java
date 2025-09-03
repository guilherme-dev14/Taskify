package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TaskDto.*;
import com.taskifyApplication.dto.common.PageResponse;
import com.taskifyApplication.model.StatusTaskEnum;
import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.service.TaskService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<PageResponse<TaskSummaryDTO>> getAllTasksFromUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) StatusTaskEnum status,
            @RequestParam(required = false) PriorityEnum priority) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
            
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<TaskSummaryDTO> tasks = taskService.getAllTasksFromUser(pageable, workspaceId, status, priority);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDetailDTO> getTaskById(@PathVariable Long id) {
        TaskDetailDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }
    @GetMapping("/kanban")
    public ResponseEntity<List<TaskSummaryDTO>> getTasksByStatus(
            @RequestParam StatusTaskEnum status,
            @RequestParam(required = false) Long workspaceId) {
        List<TaskSummaryDTO> tasks = taskService.getAllTasksByStatus(status, workspaceId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody CreateTaskDTO createTaskDTO) {
        TaskResponseDTO task = taskService.createTask(createTaskDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCurrentTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskDTO updateTaskDTO) {
        TaskResponseDTO task = taskService.updateTask(id, updateTaskDTO);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = taskService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // Workspace-wide task endpoints
    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<PageResponse<TaskSummaryDTO>> getAllTasksInWorkspace(
            @PathVariable Long workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(required = false) StatusTaskEnum status,
            @RequestParam(required = false) PriorityEnum priority) {
        try {
            Sort.Direction sortDirection = Sort.Direction.fromString(direction);
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
            
            PageResponse<TaskSummaryDTO> tasks = taskService.getAllTasksInWorkspace(workspaceId, status, priority, pageable);
            return ResponseEntity.ok(tasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/workspace/{workspaceId}/list")
    public ResponseEntity<List<TaskSummaryDTO>> getAllTasksInWorkspaceList(
            @PathVariable Long workspaceId,
            @RequestParam(required = false) StatusTaskEnum status,
            @RequestParam(required = false) PriorityEnum priority) {
        try {
            List<TaskSummaryDTO> tasks = taskService.getAllTasksInWorkspaceList(workspaceId, status, priority);
            return ResponseEntity.ok(tasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}

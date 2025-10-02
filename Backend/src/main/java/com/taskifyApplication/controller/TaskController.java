package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TaskDto.*;
import com.taskifyApplication.dto.TimeTrackingDto.TimeTrackingSummaryDTO;
import com.taskifyApplication.dto.common.PageResponse;
import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.service.TaskService;
import com.taskifyApplication.service.TimeTrackingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    private final TimeTrackingService timeTrackingService;

    @GetMapping
    public ResponseEntity<PageResponse<TaskSummaryDTO>> getAllTasksFromUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) PriorityEnum priority) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<TaskSummaryDTO> tasks = taskService.getAllTasksFromUser(pageable, workspaceId, statusId, priority);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDetailDTO> getTaskById(@PathVariable Long id) {
            TaskDetailDTO task = taskService.getTaskById(id);
            return ResponseEntity.ok(task);
    }
    @GetMapping("/kanban")
    public ResponseEntity<List<TaskSummaryDTO>> getTasksByStatus(
            @RequestParam Long statusId,
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        List<TaskSummaryDTO> tasks = taskService.getAllTasksByStatus(statusId, workspaceId, year, month);
        return ResponseEntity.ok(tasks);
    }


    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(
            @Valid @ModelAttribute CreateTaskDTO createTaskDTO
        ) {

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

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<PageResponse<TaskSummaryDTO>> getAllTasksInWorkspace(
            @PathVariable Long workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) PriorityEnum priority) {
            Sort.Direction sortDirection = Sort.Direction.fromString(direction);
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
            
            PageResponse<TaskSummaryDTO> tasks = taskService.getAllTasksInWorkspace(workspaceId, statusId, priority, pageable);
            return ResponseEntity.ok(tasks);
    }

    @GetMapping("/workspace/{workspaceId}/list")
    public ResponseEntity<List<TaskSummaryDTO>> getAllTasksInWorkspaceList(
            @PathVariable Long workspaceId,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) PriorityEnum priority) {
            List<TaskSummaryDTO> tasks = taskService.getAllTasksInWorkspaceList(workspaceId, statusId, priority);
            return ResponseEntity.ok(tasks);
    }

    // Bulk Operations
    @PutMapping("/bulk-update")
    public ResponseEntity<List<TaskResponseDTO>> bulkUpdateTasks(@Valid @RequestBody BulkTaskOperationDTO bulkUpdateDTO) {
            List<TaskResponseDTO> updatedTasks = taskService.bulkUpdateTasks(bulkUpdateDTO);
            return ResponseEntity.ok(updatedTasks);
    }

    @DeleteMapping("/bulk-delete")
    public ResponseEntity<Void> bulkDeleteTasks(@RequestBody List<Long> taskIds) {
            taskService.bulkDeleteTasks(taskIds);
            return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<TaskResponseDTO> cloneTask(@PathVariable Long id) {
            TaskResponseDTO clonedTask = taskService.cloneTask(id);
            return ResponseEntity.status(HttpStatus.CREATED).body(clonedTask);
    }

    @PostMapping("/search")
    public ResponseEntity<PageResponse<TaskSummaryDTO>> advancedSearch(
            @Valid @RequestBody AdvancedSearchDTO searchDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
                
            Pageable pageable = PageRequest.of(page, size, sort);
            PageResponse<TaskSummaryDTO> tasks = taskService.advancedSearch(searchDTO, pageable);
            return ResponseEntity.ok(tasks);
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<TaskSummaryDTO>> getTasksForDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long statusId) {
            List<TaskSummaryDTO> tasks = taskService.getTasksForDateRange(startDate, endDate, workspaceId, statusId);
            return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}/time-tracking")
    public ResponseEntity<List<com.taskifyApplication.dto.TimeTrackingDto.TimeTrackingResponseDTO>> getTaskTimeTrackingEntries(@PathVariable Long taskId) {
        return ResponseEntity.ok(timeTrackingService.getTimeTrackingEntries(taskId));
    }

    @GetMapping("/{taskId}/total-time")
    public ResponseEntity<TimeTrackingSummaryDTO> getTotalTimeSpent(@PathVariable Long taskId) {
        return ResponseEntity.ok(timeTrackingService.getTotalTimeSpent(taskId));
    }

}

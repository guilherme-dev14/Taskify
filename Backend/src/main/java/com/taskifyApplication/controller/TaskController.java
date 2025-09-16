package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TaskDto.*;
import com.taskifyApplication.dto.TimeTrackingDto.TimeTrackingSummaryDTO;
import com.taskifyApplication.dto.common.PageResponse;
import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.service.TaskService;
import com.taskifyApplication.service.TimeTrackingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TimeTrackingService timeTrackingService;

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
        try {
            TaskDetailDTO task = taskService.getTaskById(id);
            return ResponseEntity.ok(task);
        } catch (IllegalArgumentException e) {
            System.out.println("DEBUG: TaskController.getTaskById - IllegalArgumentException: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }
    @GetMapping("/kanban")
    public ResponseEntity<List<TaskSummaryDTO>> getTasksByStatus(
            @RequestParam Long statusId, // Alterado
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        List<TaskSummaryDTO> tasks = taskService.getAllTasksByStatus(statusId, workspaceId, year, month);
        return ResponseEntity.ok(tasks);
    }


    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(
            @Valid @ModelAttribute CreateTaskDTO createTaskDTO,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments) {

        createTaskDTO.setAttachments(attachments);

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
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) PriorityEnum priority) {
        try {
            Sort.Direction sortDirection = Sort.Direction.fromString(direction);
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
            
            PageResponse<TaskSummaryDTO> tasks = taskService.getAllTasksInWorkspace(workspaceId, statusId, priority, pageable);
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
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) PriorityEnum priority) {
        try {
            List<TaskSummaryDTO> tasks = taskService.getAllTasksInWorkspaceList(workspaceId, statusId, priority);
            return ResponseEntity.ok(tasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Bulk Operations
    @PutMapping("/bulk-update")
    public ResponseEntity<List<TaskResponseDTO>> bulkUpdateTasks(@Valid @RequestBody BulkTaskOperationDTO bulkUpdateDTO) {
        try {
            List<TaskResponseDTO> updatedTasks = taskService.bulkUpdateTasks(bulkUpdateDTO);
            return ResponseEntity.ok(updatedTasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/bulk-delete")
    public ResponseEntity<Void> bulkDeleteTasks(@RequestBody List<Long> taskIds) {
        try {
            taskService.bulkDeleteTasks(taskIds);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<TaskResponseDTO> cloneTask(@PathVariable Long id) {
        try {
            TaskResponseDTO clonedTask = taskService.cloneTask(id);
            return ResponseEntity.status(HttpStatus.CREATED).body(clonedTask);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Subtask Management
    @PostMapping("/{parentId}/subtasks")
    public ResponseEntity<TaskResponseDTO> createSubtask(
            @PathVariable Long parentId,
            @Valid @RequestBody CreateSubtaskDTO createSubtaskDTO) {
        try {
            createSubtaskDTO.setParentTaskId(parentId);
            TaskResponseDTO subtask = taskService.createSubtask(createSubtaskDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(subtask);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{parentId}/subtasks")
    public ResponseEntity<List<TaskSummaryDTO>> getSubtasks(@PathVariable Long parentId) {
        try {
            List<TaskSummaryDTO> subtasks = taskService.getSubtasks(parentId);
            return ResponseEntity.ok(subtasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{subtaskId}/parent")
    public ResponseEntity<TaskSummaryDTO> getParentTask(@PathVariable Long subtaskId) {
        try {
            TaskSummaryDTO parentTask = taskService.getParentTask(subtaskId);
            return ResponseEntity.ok(parentTask);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{taskId}/convert-to-subtask/{parentId}")
    public ResponseEntity<Void> convertToSubtask(
            @PathVariable Long taskId,
            @PathVariable Long parentId) {
        try {
            taskService.convertToSubtask(taskId, parentId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{subtaskId}/promote-to-main-task")
    public ResponseEntity<Void> promoteToMainTask(@PathVariable Long subtaskId) {
        try {
            taskService.promoteToMainTask(subtaskId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Advanced Search
    @PostMapping("/search")
    public ResponseEntity<PageResponse<TaskSummaryDTO>> advancedSearch(
            @Valid @RequestBody AdvancedSearchDTO searchDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
                
            Pageable pageable = PageRequest.of(page, size, sort);
            PageResponse<TaskSummaryDTO> tasks = taskService.advancedSearch(searchDTO, pageable);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Calendar View endpoints
    @GetMapping("/calendar")
    public ResponseEntity<List<TaskSummaryDTO>> getTasksForDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long statusId) {
        try {
            List<TaskSummaryDTO> tasks = taskService.getTasksForDateRange(startDate, endDate, workspaceId, statusId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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

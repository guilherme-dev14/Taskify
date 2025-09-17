package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TaskStatusDto.CreateTaskStatusDTO;
import com.taskifyApplication.dto.TaskStatusDto.StatusOrderUpdateDTO;
import com.taskifyApplication.dto.TaskStatusDto.TaskStatusDTO;
import com.taskifyApplication.dto.TaskStatusDto.UpdateTaskStatusDTO;
import com.taskifyApplication.service.TaskStatusService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/statuses")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
public class TaskStatusController {

    @Autowired
    private TaskStatusService taskStatusService;

    @GetMapping
    public ResponseEntity<List<TaskStatusDTO>> getStatuses(@PathVariable Long workspaceId) {
        try {
            List<TaskStatusDTO> statuses = taskStatusService.getStatusesForWorkspace(workspaceId);
            return ResponseEntity.ok(statuses);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createStatus(@Valid @RequestBody CreateTaskStatusDTO createDto) {
        try {
            // Garante que o DTO e o PathVariable correspondem
            createDto.setWorkspaceId(createDto.getWorkspaceId());
            TaskStatusDTO newStatus = taskStatusService.createStatus(createDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(newStatus);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{statusId}")
    public ResponseEntity<?> updateStatus(@PathVariable Long workspaceId, @Valid @RequestBody UpdateTaskStatusDTO updateDto) {
        try {
            updateDto.setId(updateDto.getId());
            TaskStatusDTO updatedStatus = taskStatusService.updateStatus(updateDto.getId(), workspaceId, updateDto);
            return ResponseEntity.ok(updatedStatus);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderStatuses(
            @PathVariable Long workspaceId,
            @RequestBody List<StatusOrderUpdateDTO> statusUpdates
    ) {
        taskStatusService.reorderStatuses(workspaceId, statusUpdates);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{statusId}")
    public ResponseEntity<?> deleteStatus(@PathVariable Long workspaceId, @PathVariable Long statusId) {
        try {
            taskStatusService.deleteStatus(statusId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
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
            List<TaskStatusDTO> statuses = taskStatusService.getStatusesForWorkspace(workspaceId);
            return ResponseEntity.ok(statuses);
    }

    @PostMapping
    public ResponseEntity<?> createStatus(@Valid @RequestBody CreateTaskStatusDTO createDto) {
            createDto.setWorkspaceId(createDto.getWorkspaceId());
            TaskStatusDTO newStatus = taskStatusService.createStatus(createDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(newStatus);
    }

    @PutMapping("/{statusId}")
    public ResponseEntity<?> updateStatus(@PathVariable Long workspaceId, @PathVariable Long statusId ,@Valid @RequestBody UpdateTaskStatusDTO updateDto) {
            TaskStatusDTO updatedStatus = taskStatusService.updateStatus(statusId, workspaceId, updateDto);
            return ResponseEntity.ok(updatedStatus);
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
            taskStatusService.deleteStatus(statusId);
            return ResponseEntity.noContent().build();
    }
}
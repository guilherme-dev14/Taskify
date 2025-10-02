package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TaskDto.TaskHistoryDTO;
import com.taskifyApplication.service.TaskHistoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/history")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class TaskHistoryController {

    private final TaskHistoryService taskHistoryService;

    @GetMapping
    public ResponseEntity<List<TaskHistoryDTO>> getTaskHistory(@PathVariable Long taskId) {
            List<TaskHistoryDTO> history = taskHistoryService.getTaskHistory(taskId);
            return ResponseEntity.ok(history);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<TaskHistoryDTO>> getTaskHistoryPaginated(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "changedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
            Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<TaskHistoryDTO> history = taskHistoryService.getTaskHistory(taskId, pageable);
            return ResponseEntity.ok(history);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearTaskHistory(@PathVariable Long taskId) {
            taskHistoryService.clearTaskHistory(taskId);
            return ResponseEntity.noContent().build();
    }
}

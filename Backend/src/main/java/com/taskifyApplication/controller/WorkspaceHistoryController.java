package com.taskifyApplication.controller;


import com.taskifyApplication.dto.TaskDto.TaskHistoryDTO;
import com.taskifyApplication.service.TaskHistoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workspace/{workspaceId}/history")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
class WorkspaceHistoryController {


    private final TaskHistoryService taskHistoryService;

    @GetMapping
    public ResponseEntity<Page<TaskHistoryDTO>> getWorkspaceHistory(
            @PathVariable Long workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "changedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<TaskHistoryDTO> history = taskHistoryService.getWorkspaceHistory(workspaceId, pageable);
        return ResponseEntity.ok(history);
    }
}
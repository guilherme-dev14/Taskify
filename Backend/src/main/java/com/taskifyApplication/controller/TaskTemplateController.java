package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TaskDto.TaskResponseDTO;
import com.taskifyApplication.dto.TaskTemplateDto.*;
import com.taskifyApplication.service.TaskTemplateService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task-templates")
@SecurityRequirement(name = "bearerAuth")
public class TaskTemplateController {

    @Autowired
    private TaskTemplateService taskTemplateService;

    @PostMapping
    public ResponseEntity<TaskTemplateResponseDTO> createTemplate(@Valid @RequestBody CreateTaskTemplateDTO createDTO) {
        try {
            TaskTemplateResponseDTO template = taskTemplateService.createTemplate(createDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(template);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<TaskTemplateResponseDTO>> getWorkspaceTemplates(@PathVariable Long workspaceId) {
        try {
            List<TaskTemplateResponseDTO> templates = taskTemplateService.getWorkspaceTemplates(workspaceId);
            return ResponseEntity.ok(templates);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{templateId}/create-task")
    public ResponseEntity<TaskResponseDTO> createTaskFromTemplate(
            @PathVariable Long templateId,
            @RequestParam Long workspaceId) {
        try {
            TaskResponseDTO task = taskTemplateService.createTaskFromTemplate(templateId, workspaceId);
            return ResponseEntity.status(HttpStatus.CREATED).body(task);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{templateId}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long templateId) {
        try {
            taskTemplateService.deleteTemplate(templateId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
package com.taskifyApplication.controller;

import com.taskifyApplication.dto.WorkspaceDto.*;
import com.taskifyApplication.service.WorkspaceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspace")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @GetMapping
    public ResponseEntity<List<WorkspaceNameDTO>> getWorkspacesFromUser() {
        try {
            List<WorkspaceNameDTO> workspace = workspaceService.getUserWorkspaces();
            return ResponseEntity.ok(workspace);
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public void deleteWorkspacesFromUser( @PathVariable Long id ) {
            workspaceService.deleteWorkspace(id);
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponseDTO> createWorkspace(@RequestBody CreateWorkspaceDTO createWorkspaceDTO) {
        try {
            WorkspaceResponseDTO workspaceResponseDTO = workspaceService.createWorkspace(createWorkspaceDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(workspaceResponseDTO);
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping
    public ResponseEntity<WorkspaceResponseDTO> updateWorkspace(@RequestBody UpdateWorkspaceDTO updateWorkspaceDTO) {
        try {
            WorkspaceResponseDTO workspaceResponseDTO = workspaceService.updateWorkspace(updateWorkspaceDTO);
            return ResponseEntity.status(HttpStatus.OK).body(workspaceResponseDTO);
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceSummaryDTO> getWorkspaceSummary(@PathVariable Long id) {
        try {
            WorkspaceSummaryDTO workspaceSummaryDTO = workspaceService.getWorkspaceSummary(id);
            return ResponseEntity.ok(workspaceSummaryDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


}

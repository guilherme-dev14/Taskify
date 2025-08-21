package com.taskifyApplication.controller;

import com.taskifyApplication.dto.TaskDto.TaskResponseDTO;
import com.taskifyApplication.dto.WorkspaceDto.CreateWorkspaceDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceNameDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceResponseDTO;
import com.taskifyApplication.service.WorkspaceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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


}

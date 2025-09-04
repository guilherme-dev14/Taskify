package com.taskifyApplication.controller;

import com.taskifyApplication.dto.WorkspaceDto.*;
import com.taskifyApplication.service.WorkspaceService;
import com.taskifyApplication.service.UserService;
import com.taskifyApplication.model.User;
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
    
    @Autowired
    private UserService userService;

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

    // Workspace Sharing Endpoints
    @PostMapping("/{workspaceId}/join")
    public ResponseEntity<WorkspaceResponseDTO> joinWorkspaceByInviteCode(@RequestBody JoinWorkspaceDTO joinWorkspaceDTO) {
        try {
            User currentUser = userService.getCurrentUser();
            workspaceService.joinWorkspaceByInviteCode(joinWorkspaceDTO.getInviteCode(), currentUser);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{workspaceId}/invite")
    public ResponseEntity<String> inviteUserByEmail(@PathVariable Long workspaceId, @RequestBody InviteUserDTO inviteUserDTO) {
        try {
            User currentUser = userService.getCurrentUser();
            User userToInvite = userService.findByEmail(inviteUserDTO.getEmail());
            
            if (userToInvite == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            workspaceService.addMemberToWorkspace(workspaceId, userToInvite, inviteUserDTO.getRole(), currentUser);
            return ResponseEntity.ok("User invited successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceMembersResponseDTO>> getWorkspaceMembers(@PathVariable Long workspaceId) {
        try {
            List<WorkspaceMembersResponseDTO> members = workspaceService.getWorkspaceMembers(workspaceId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/member/role")
    public ResponseEntity<String> updateMemberRole(@RequestBody UpdateMemberRoleDTO updateMemberRoleDTO) {
        try {
            User currentUser = userService.getCurrentUser();
            User userToUpdate = userService.findById(updateMemberRoleDTO.getUserId());
            
            workspaceService.updateMemberRole(
                updateMemberRoleDTO.getWorkspaceId(), 
                userToUpdate, 
                updateMemberRoleDTO.getNewRole(), 
                currentUser
            );
            return ResponseEntity.ok("Member role updated successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/member")
    public ResponseEntity<String> removeMember(@RequestBody RemoveMemberDTO removeMemberDTO) {
        try {
            User currentUser = userService.getCurrentUser();
            User userToRemove = userService.findById(removeMemberDTO.getUserId());
            
            workspaceService.removeMemberFromWorkspace(
                removeMemberDTO.getWorkspaceId(), 
                userToRemove, 
                currentUser
            );
            return ResponseEntity.ok("Member removed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{workspaceId}/invite-code/regenerate")
    public ResponseEntity<String> regenerateInviteCode(@PathVariable Long workspaceId) {
        try {
            User currentUser = userService.getCurrentUser();
            String newInviteCode = workspaceService.generateNewInviteCode(workspaceId, currentUser);
            return ResponseEntity.ok(newInviteCode);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{workspaceId}/invite-code")
    public ResponseEntity<String> getInviteCode(@PathVariable Long workspaceId) {
        try {
            String inviteCode = workspaceService.getWorkspaceInviteCode(workspaceId);
            return ResponseEntity.ok(inviteCode);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

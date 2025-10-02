package com.taskifyApplication.controller;

import com.taskifyApplication.dto.WorkspaceDto.*;
import com.taskifyApplication.dto.ErrorResponseDTO;
import com.taskifyApplication.service.WorkspaceService;
import com.taskifyApplication.service.UserService;
import com.taskifyApplication.model.User;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    public ResponseEntity<?> getWorkspacesFromUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
            Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
            Page<WorkspaceNameDTO> workspacePage = workspaceService.getUserWorkspaces(pageable);
            return ResponseEntity.ok(workspacePage);
    }

    @GetMapping("/list")
    public ResponseEntity<?> getWorkspacesListFromUser() {
            List<WorkspaceNameDTO> workspaces = workspaceService.getUserWorkspacesList();
            return ResponseEntity.ok(workspaces);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkspacesFromUser( @PathVariable Long id ) {
            workspaceService.deleteWorkspace(id);
            return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> createWorkspace(@Valid @RequestBody CreateWorkspaceDTO createWorkspaceDTO) {
            WorkspaceResponseDTO workspaceResponseDTO = workspaceService.createWorkspace(createWorkspaceDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(workspaceResponseDTO);
    }

    @PutMapping
    public ResponseEntity<?> updateWorkspace(@Valid @RequestBody UpdateWorkspaceDTO updateWorkspaceDTO) {
            WorkspaceResponseDTO workspaceResponseDTO = workspaceService.updateWorkspace(updateWorkspaceDTO);
            return ResponseEntity.status(HttpStatus.OK).body(workspaceResponseDTO);
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkspaceSummary(@PathVariable Long id) {
            WorkspaceSummaryDTO workspaceSummaryDTO = workspaceService.getWorkspaceSummary(id);
            return ResponseEntity.ok(workspaceSummaryDTO);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinWorkspaceByInviteCode(@RequestBody JoinWorkspaceDTO joinWorkspaceDTO) {
            workspaceService.joinWorkspaceByInviteCode(joinWorkspaceDTO.getInviteCode());
            return ResponseEntity.ok().build();
    }
    @PostMapping("/{workspaceId}/inviteUsername")
    public ResponseEntity<?> inviteUserByUsername(@PathVariable Long workspaceId, @RequestBody InviteUserDTO inviteUserDTO) {
        try {
            User userToInvite = userService.findByUsername(inviteUserDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("User with username " + inviteUserDTO.getUsername() + " not found"));

            workspaceService.inviteUserToWorkspace(workspaceId, userToInvite, inviteUserDTO.getRole());
            return ResponseEntity.ok("User invited successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponseDTO(
                    LocalDateTime.now(),
                    400,
                    "Bad Request",
                    e.getMessage(),
                    "/api/workspace/" + workspaceId + "/inviteUsername"
                ));
        }
    }
    @PostMapping("/{workspaceId}/invite")
    public ResponseEntity<?> inviteUserByEmail(@PathVariable Long workspaceId, @RequestBody InviteUserDTO inviteUserDTO) {
        try {
            User userToInvite = userService.findByEmail(inviteUserDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("User with email " + inviteUserDTO.getEmail() + " not found"));

            workspaceService.inviteUserToWorkspace(workspaceId, userToInvite, inviteUserDTO.getRole());
            return ResponseEntity.ok("User invited successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponseDTO(
                    LocalDateTime.now(),
                    400,
                    "Bad Request",
                    e.getMessage(),
                    "/api/workspace/" + workspaceId + "/invite"
                ));
        }
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<?> getWorkspaceMembers(@PathVariable Long workspaceId) {
            List<WorkspaceMembersResponseDTO> members = workspaceService.getWorkspaceMembers(workspaceId);
            return ResponseEntity.ok(members);
    }

    @PutMapping("/member/role")
    public ResponseEntity<?> updateMemberRole(@RequestBody UpdateMemberRoleDTO updateMemberRoleDTO) {
            User userToUpdate = userService.findById(updateMemberRoleDTO.getUserId()).orElse(null);
            workspaceService.updateMemberRole(
                updateMemberRoleDTO.getWorkspaceId(), 
                userToUpdate, 
                updateMemberRoleDTO.getNewRole()
            );
            return ResponseEntity.ok("Member role updated successfully");
    }

    @DeleteMapping("/member")
    public ResponseEntity<?> removeMember(@RequestBody RemoveMemberDTO removeMemberDTO) {
            User userToRemove = userService.findById(removeMemberDTO.getUserId()).orElse(null);
            workspaceService.removeMemberFromWorkspace(
                removeMemberDTO.getWorkspaceId(), 
                userToRemove
            );
            return ResponseEntity.ok("Member removed successfully");
    }

    @PostMapping("/{workspaceId}/invite-code/regenerate")
    public ResponseEntity<?> regenerateInviteCode(@PathVariable Long workspaceId) {
            String newInviteCode = workspaceService.generateNewInviteCode(workspaceId);
            return ResponseEntity.ok(newInviteCode);
    }

    @GetMapping("/{workspaceId}/invite-code")
    public ResponseEntity<?> getInviteCode(@PathVariable Long workspaceId) {
            String inviteCode = workspaceService.getWorkspaceInviteCode(workspaceId);
            return ResponseEntity.ok(inviteCode);
    }

    @GetMapping("/invitations/pending")
    public ResponseEntity<?> getPendingInvitations() {
        List<WorkspaceInvitationDTO> invitations = workspaceService.getPendingInvitations();
        return ResponseEntity.ok(invitations);
    }

    @PostMapping("/invitations/respond")
    public ResponseEntity<?> respondToInvitation(@RequestBody InvitationResponseDTO response) {
        try {
            workspaceService.respondToInvitation(response.getInvitationId(), response.isAccept());
            String message = response.isAccept() ? "Invitation accepted successfully" : "Invitation declined successfully";
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponseDTO(
                    LocalDateTime.now(),
                    400,
                    "Bad Request",
                    e.getMessage(),
                    "/api/workspace/invitations/respond"
                ));
        }
    }
}

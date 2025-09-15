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
            @RequestParam(defaultValue = "6") int size) { // Default size set to 6 as requested
        try {
            User currentUser = userService.getCurrentUser();
            Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
            Page<WorkspaceNameDTO> workspacePage = workspaceService.getUserWorkspaces(pageable);
            return ResponseEntity.ok(workspacePage);
        } catch(Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getWorkspacesListFromUser() {
        try {
            List<WorkspaceNameDTO> workspaces = workspaceService.getUserWorkspacesList();
            return ResponseEntity.ok(workspaces);
        } catch(Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkspacesFromUser( @PathVariable Long id ) {
        try {
            workspaceService.deleteWorkspace(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> createWorkspace(@Valid @RequestBody CreateWorkspaceDTO createWorkspaceDTO) {
        try {
            WorkspaceResponseDTO workspaceResponseDTO = workspaceService.createWorkspace(createWorkspaceDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(workspaceResponseDTO);
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch(Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping
    public ResponseEntity<?> updateWorkspace(@Valid @RequestBody UpdateWorkspaceDTO updateWorkspaceDTO) {
        try {
            WorkspaceResponseDTO workspaceResponseDTO = workspaceService.updateWorkspace(updateWorkspaceDTO);
            return ResponseEntity.status(HttpStatus.OK).body(workspaceResponseDTO);
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch(Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkspaceSummary(@PathVariable Long id) {
        try {
            WorkspaceSummaryDTO workspaceSummaryDTO = workspaceService.getWorkspaceSummary(id);
            return ResponseEntity.ok(workspaceSummaryDTO);
        } catch (IllegalArgumentException | IllegalStateException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Workspace Sharing Endpoints
    @PostMapping("/join")
    public ResponseEntity<?> joinWorkspaceByInviteCode(@RequestBody JoinWorkspaceDTO joinWorkspaceDTO) {
        try {
            User currentUser = userService.getCurrentUser();
            workspaceService.joinWorkspaceByInviteCode(joinWorkspaceDTO.getInviteCode(), currentUser);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    @PostMapping("/{workspaceId}/inviteUsername")
    public ResponseEntity<?> inviteUserByUsername(@PathVariable Long workspaceId, @RequestBody InviteUserDTO inviteUserDTO) {
        try {
            User currentUser = userService.getCurrentUser();
            User userToInvite = userService.findByUsername(inviteUserDTO.getUsername()).orElse(null);

            if (userToInvite == null) {
                ErrorResponseDTO error = new ErrorResponseDTO("Usuario nao encontrado", HttpStatus.INTERNAL_SERVER_ERROR.value());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            workspaceService.addMemberToWorkspace(workspaceId, userToInvite, inviteUserDTO.getRole(), currentUser);
            return ResponseEntity.ok("User invited successfully");
        }  catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    @PostMapping("/{workspaceId}/invite")
    public ResponseEntity<?> inviteUserByEmail(@PathVariable Long workspaceId, @RequestBody InviteUserDTO inviteUserDTO) {
        try {
            User currentUser = userService.getCurrentUser();
            User userToInvite = userService.findByEmail(inviteUserDTO.getEmail()).orElse(null);
            
            if (userToInvite == null) {
                ErrorResponseDTO error = new ErrorResponseDTO("Usuário não encontrado", HttpStatus.BAD_REQUEST.value());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            workspaceService.addMemberToWorkspace(workspaceId, userToInvite, inviteUserDTO.getRole(), currentUser);
            return ResponseEntity.ok("User invited successfully");
        } catch (IllegalArgumentException | IllegalStateException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<?> getWorkspaceMembers(@PathVariable Long workspaceId) {
        try {
            List<WorkspaceMembersResponseDTO> members = workspaceService.getWorkspaceMembers(workspaceId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/member/role")
    public ResponseEntity<?> updateMemberRole(@RequestBody UpdateMemberRoleDTO updateMemberRoleDTO) {
        try {
            User currentUser = userService.getCurrentUser();
            User userToUpdate = userService.findById(updateMemberRoleDTO.getUserId()).orElse(null);
            
            if (userToUpdate == null) {
                ErrorResponseDTO error = new ErrorResponseDTO("Usuário não encontrado", HttpStatus.BAD_REQUEST.value());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            workspaceService.updateMemberRole(
                updateMemberRoleDTO.getWorkspaceId(), 
                userToUpdate, 
                updateMemberRoleDTO.getNewRole(), 
                currentUser
            );
            return ResponseEntity.ok("Member role updated successfully");
        } catch (IllegalArgumentException | IllegalStateException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/member")
    public ResponseEntity<?> removeMember(@RequestBody RemoveMemberDTO removeMemberDTO) {
        try {
            User currentUser = userService.getCurrentUser();
            User userToRemove = userService.findById(removeMemberDTO.getUserId()).orElse(null);
            
            if (userToRemove == null) {
                ErrorResponseDTO error = new ErrorResponseDTO("Usuário não encontrado", HttpStatus.BAD_REQUEST.value());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            workspaceService.removeMemberFromWorkspace(
                removeMemberDTO.getWorkspaceId(), 
                userToRemove, 
                currentUser
            );
            return ResponseEntity.ok("Member removed successfully");
        } catch (IllegalArgumentException | IllegalStateException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/{workspaceId}/invite-code/regenerate")
    public ResponseEntity<?> regenerateInviteCode(@PathVariable Long workspaceId) {
        try {
            User currentUser = userService.getCurrentUser();
            String newInviteCode = workspaceService.generateNewInviteCode(workspaceId, currentUser);
            return ResponseEntity.ok(newInviteCode);
        } catch (IllegalArgumentException | IllegalStateException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{workspaceId}/invite-code")
    public ResponseEntity<?> getInviteCode(@PathVariable Long workspaceId) {
        try {
            String inviteCode = workspaceService.getWorkspaceInviteCode(workspaceId);
            return ResponseEntity.ok(inviteCode);
        } catch (IllegalArgumentException | IllegalStateException e) {
            ErrorResponseDTO error = new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ErrorResponseDTO error = new ErrorResponseDTO("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

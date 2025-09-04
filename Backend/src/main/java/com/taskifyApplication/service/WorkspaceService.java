package com.taskifyApplication.service;

import com.taskifyApplication.dto.WorkspaceDto.*;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.model.RoleEnum;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.model.WorkspaceMember;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.UserRepository;
import com.taskifyApplication.repository.WorkspaceMemberRepository;
import com.taskifyApplication.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class WorkspaceService {

    // region REPOSITORIES
    @Autowired
    private WorkspaceRepository workspaceRepository;
    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private NotificationService notificationService;

    // endregion

    // region CRUD
    public List<WorkspaceNameDTO> getUserWorkspaces() {
        User currentUser = getCurrentUser();
        return workspaceRepository.findAllAccessibleByUser(currentUser);
    }
    public WorkspaceSummaryDTO getWorkspaceSummary(Long id) {
        User currentUser = getCurrentUser();
        if(workspaceRepository.existsById(id)
                && workspaceRepository.accessibleForUser(currentUser, id))
        {
            return convertToWorkspaceSummaryDTO(workspaceRepository.getReferenceById(id));
        }
        else {
            throw new IllegalStateException("Workspace not found or you dont have access");
        }
    }

    public Workspace getWorkspaceById(Long workspaceId) {
        User currentUser = getCurrentUser();
        if(workspaceRepository.existsById(workspaceId)
                && workspaceRepository.accessibleForUser(currentUser, workspaceId))
        {
            return workspaceRepository.getReferenceById(workspaceId);
        }
        else {
            throw new IllegalStateException("Workspace not found or you dont have access");
        }
    }

    public WorkspaceResponseDTO createWorkspace(CreateWorkspaceDTO createWorkspaceDTO) {
        User owner = getCurrentUser();
        List<Workspace> existingWorkspaces = workspaceRepository.findByOwner(owner);
        boolean nameExists = existingWorkspaces.stream()
                .anyMatch(w -> w.getName().equalsIgnoreCase(createWorkspaceDTO.getName()));

        if (nameExists) {
            throw new IllegalArgumentException("You already have a workspace with this name");
        }

        Workspace workspace = Workspace.builder()
                .name(createWorkspaceDTO.getName())
                .description(createWorkspaceDTO.getDescription())
                .owner(owner)
                .inviteCode(generateInviteCode())
                .build();

        workspace = workspaceRepository.save(workspace);

        WorkspaceMember ownerMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(owner)
                .role(RoleEnum.OWNER)
                .build();

        workspaceMemberRepository.save(ownerMember);

        return convertToWorkspaceResponseDTO(workspace);
    }

    public void deleteWorkspace(Long workspaceId) {
        Workspace workspace = workspaceRepository.getReferenceById(workspaceId);
        User user = getCurrentUser();

        if (!workspace.getOwner().equals(user)) {
            throw new IllegalArgumentException("Cannot delete workspace if you are not the OWNER");
        }
        workspaceRepository.delete(workspace);
    }

    public WorkspaceResponseDTO updateWorkspace(UpdateWorkspaceDTO updateWorkspaceDTO) {

        Workspace workspace = workspaceRepository.findById(updateWorkspaceDTO.getId())
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        User user = getCurrentUser();
        if (!workspace.getOwner().equals(user)) {
            throw new IllegalArgumentException("Cannot update workspace if you are not the OWNER");
        }
        if(updateWorkspaceDTO.getName() != null && !updateWorkspaceDTO.getName().equals(workspace.getName())) {
            workspace.setName(updateWorkspaceDTO.getName());
        }
        if(updateWorkspaceDTO.getDescription() != null && !updateWorkspaceDTO.getDescription().equals(workspace.getDescription())) {
            workspace.setDescription(updateWorkspaceDTO.getDescription());
        }
        workspaceRepository.save(workspace);
        return convertToWorkspaceResponseDTO(workspace);
    }

    // endregion

    // region MEMBERS CONFIG
    public void addMemberToWorkspace(Long workspaceId, User userToAdd, RoleEnum role, User requestingUser) {
        Workspace workspace = getWorkspaceById(workspaceId);

        if (canUserManageWorkspace(workspace, requestingUser)) {
            throw new IllegalArgumentException("You don't have permission to add members to this workspace");
        }

        if (workspaceMemberRepository.existsByWorkspaceAndUser(workspace, userToAdd)) {
            throw new IllegalArgumentException("User is already a member of this workspace");
        }

        WorkspaceMember newMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(userToAdd)
                .role(role)
                .build();

        workspaceMemberRepository.save(newMember);
        
        // Notify the invited user
        notificationService.notifyWorkspaceInvite(userToAdd, workspace, requestingUser);
    }

    public void removeMemberFromWorkspace(Long workspaceId, User userToRemove, User requestingUser) {
        Workspace workspace = getWorkspaceById(workspaceId);

       if (canUserManageWorkspace(workspace, requestingUser)) {
            throw new IllegalArgumentException("You don't have permission to remove members from this workspace");
        }

        if (workspace.getOwner().equals(userToRemove)) {
            throw new IllegalArgumentException("Cannot remove workspace owner");
        }

        Optional<WorkspaceMember> memberToRemove = workspaceMemberRepository.findByWorkspaceAndUser(workspace, userToRemove);
        
        if (memberToRemove.isPresent()) {
            workspaceMemberRepository.delete(memberToRemove.get());
        } else {
            throw new IllegalArgumentException("User is not a member of this workspace");
        }
    }

    public void updateMemberRole(Long workspaceId, User userToUpdate, RoleEnum newRole, User requestingUser) {
        Workspace workspace = getWorkspaceById(workspaceId);

        if (canUserManageWorkspace(workspace, requestingUser)) {
            throw new IllegalArgumentException("You don't have permission to update member roles");
        }

        if (workspace.getOwner().equals(userToUpdate)) {
            throw new IllegalArgumentException("Cannot change workspace owner role");
        }

        int updatedRows = workspaceMemberRepository.updateMemberRole(workspace, userToUpdate, newRole);

        if (updatedRows == 0) {
            throw new IllegalArgumentException("User is not an active member of this workspace");
        }
    }
    // endregion

    // region VALIDATION
    public boolean canUserAccessWorkspace(Workspace workspace, User user) {
        return workspace.getOwner().equals(user) ||
                workspaceMemberRepository.existsByWorkspaceAndUser(workspace, user);
    }

    public boolean canUserManageWorkspace(Workspace workspace, User user) {
        return !workspace.getOwner().equals(user) &&
                !workspaceMemberRepository.canUserManage(workspace.getId(), user);
    }

    public RoleEnum getUserRoleInWorkspace(Workspace workspace, User user) {
        if (workspace.getOwner().equals(user)) {
            return RoleEnum.OWNER;
        }

        return workspaceMemberRepository.findByWorkspaceAndUser(workspace, user)
                .map(WorkspaceMember::getRole)
                .orElse(null);
    }
    // endregion

    // region INVITE CODE

    public Workspace joinWorkspaceByInviteCode(String inviteCode, User user) {
        Workspace workspace = workspaceRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));

        if (workspaceMemberRepository.existsByWorkspaceAndUser(workspace, user) || workspace.getOwner().equals(user)) {
            throw new IllegalArgumentException("You are already a member of this workspace");
        }

        WorkspaceMember newMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(user)
                .role(RoleEnum.MEMBER)
                .build();

        workspaceMemberRepository.save(newMember);
        
        // Notify existing members about new member
        workspace.getMembers().forEach(member -> {
            if (!member.getUser().equals(user)) {
                notificationService.notifyMemberJoined(member.getUser(), workspace, user);
            }
        });
        
        // Also notify the owner if they're not already in the members list
        if (!workspace.getOwner().equals(user)) {
            notificationService.notifyMemberJoined(workspace.getOwner(), workspace, user);
        }

        return workspace;
    }

    public String generateNewInviteCode(Long workspaceId, User requestingUser) {
        Workspace workspace = getWorkspaceById(workspaceId);

        if (canUserManageWorkspace(workspace, requestingUser)) {
            throw new IllegalArgumentException("You don't have permission to generate invite codes");
        }

        String newInviteCode = generateInviteCode();
        workspace.setInviteCode(newInviteCode);
        workspaceRepository.save(workspace);

        return newInviteCode;
    }

    private String generateInviteCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (workspaceRepository.existsByInviteCode(code));

        return code;
    }

    public String getWorkspaceInviteCode(Long workspaceId) {
        User currentUser = getCurrentUser();
        Workspace workspace = getWorkspaceById(workspaceId);

        if (canUserManageWorkspace(workspace, currentUser)) {
            throw new IllegalArgumentException("You don't have permission to view invite codes for this workspace");
        }

        return workspace.getInviteCode();
    }

    public List<WorkspaceMembersResponseDTO> getWorkspaceMembers(Long workspaceId) {
        User currentUser = getCurrentUser();
        Workspace workspace = getWorkspaceById(workspaceId);

        if (!canUserAccessWorkspace(workspace, currentUser)) {
            throw new IllegalArgumentException("You don't have access to this workspace");
        }

        List<WorkspaceMembersResponseDTO> members = workspace.getMembers().stream()
                .map(this::convertToWorkspaceMemberResponseDTO)
                .collect(Collectors.toList());

        return members;
    }
    // endregion

    // region PRIVATE FUNCTIONS
    private WorkspaceResponseDTO convertToWorkspaceResponseDTO(Workspace workspace) {
        WorkspaceResponseDTO workspaceResponseDTO = new WorkspaceResponseDTO();
        workspaceResponseDTO.setName(workspace.getName());
        workspaceResponseDTO.setDescription(workspace.getDescription());
        workspaceResponseDTO.setInviteCode(workspace.getInviteCode());
        workspaceResponseDTO.setCreatedAt(workspace.getCreatedAt());
        workspaceResponseDTO.setUpdatedAt(workspace.getUpdatedAt());
        return workspaceResponseDTO;
    }

    private WorkspaceSummaryDTO convertToWorkspaceSummaryDTO(Workspace workspace) {
        User user = getCurrentUser();
        WorkspaceSummaryDTO workspaceSummaryDTO = new WorkspaceSummaryDTO();
        workspaceSummaryDTO.setName(workspace.getName());
        workspaceSummaryDTO.setDescription(workspace.getDescription());
        workspaceSummaryDTO.setCreatedAt(workspace.getCreatedAt());
        workspaceSummaryDTO.setOwnerName(workspace.getOwner().getFirstName() + " " + workspace.getOwner().getLastName());
        workspaceSummaryDTO.setMemberCount(workspace.getMembers().size());
        workspaceSummaryDTO.setTaskCount(taskRepository.findByWorkspaceAndAssignedTo(workspace, user, null, null).size());
        return workspaceSummaryDTO;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private WorkspaceMembersResponseDTO convertToWorkspaceMemberResponseDTO(WorkspaceMember member) {
        WorkspaceMembersResponseDTO dto = new WorkspaceMembersResponseDTO();
        dto.setId(member.getId());
        dto.setUser(convertToUserSummaryDTO(member.getUser()));
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        dto.setOwner(false);
        return dto;
    }

    private UserSummaryDTO convertToUserSummaryDTO(User user) {
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        return dto;
    }
    //endregion
}

package com.taskifyApplication.service;

import com.taskifyApplication.dto.WorkspaceDto.WorkspaceNameDTO;
import com.taskifyApplication.model.RoleEnum;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.model.WorkspaceMember;
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

    // endregion

    // region CRUD
    public List<WorkspaceNameDTO> getUserWorkspaces() {
        User currentUser = getCurrentUser();
        return workspaceRepository.findAllAccessibleByUser(currentUser);
    }

    public Workspace getWorkspaceById(Long workspaceId) {
        return workspaceRepository.getReferenceById(workspaceId);
    }

    public Workspace createWorkspace(String name, String description, User owner) {
        List<Workspace> existingWorkspaces = workspaceRepository.findByOwner(owner);
        boolean nameExists = existingWorkspaces.stream()
                .anyMatch(w -> w.getName().equalsIgnoreCase(name));

        if (nameExists) {
            throw new IllegalArgumentException("You already have a workspace with this name");
        }

        Workspace workspace = Workspace.builder()
                .name(name)
                .description(description)
                .owner(owner)
                .inviteCode(generateInviteCode())
                .build();

        workspace = workspaceRepository.save(workspace);

        WorkspaceMember ownerMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(owner)
                .role(RoleEnum.OWNER)
                .isActive(true)
                .build();

        workspaceMemberRepository.save(ownerMember);

        return workspace;
    }

    public void deleteWorkspace(Long workspaceId) {
        Workspace workspace = workspaceRepository.getReferenceById(workspaceId);
        User user = getCurrentUser();

        if (workspace.getOwner().equals(user)) {
            throw new IllegalArgumentException("Cannot delete workspace if you are not the OWNER");
        }
        workspaceRepository.delete(workspace);
    }

    // endregion

    // region MEMBERS CONFIG
    public void addMemberToWorkspace(Long workspaceId, User userToAdd, RoleEnum role, User requestingUser) {
        Workspace workspace = getWorkspaceById(workspaceId);

        if (canUserManageWorkspace(workspace, requestingUser)) {
            throw new IllegalArgumentException("You don't have permission to add members to this workspace");
        }

        if (workspaceMemberRepository.existsByWorkspaceAndUserAndIsActive(workspace, userToAdd, true)) {
            throw new IllegalArgumentException("User is already a member of this workspace");
        }

        Optional<WorkspaceMember> existingMember = workspaceMemberRepository.findByWorkspaceAndUser(workspace, userToAdd);

        if (existingMember.isPresent()) {
            WorkspaceMember member = existingMember.get();
            member.setIsActive(true);
            member.setRole(role);
            workspaceMemberRepository.save(member);
        } else {
            WorkspaceMember newMember = WorkspaceMember.builder()
                    .workspace(workspace)
                    .user(userToAdd)
                    .role(role)
                    .isActive(true)
                    .build();

            workspaceMemberRepository.save(newMember);
        }
    }

    public void removeMemberFromWorkspace(Long workspaceId, User userToRemove, User requestingUser) {
        Workspace workspace = getWorkspaceById(workspaceId);

       if (canUserManageWorkspace(workspace, requestingUser)) {
            throw new IllegalArgumentException("You don't have permission to remove members from this workspace");
        }

        if (workspace.getOwner().equals(userToRemove)) {
            throw new IllegalArgumentException("Cannot remove workspace owner");
        }

        int updatedRows = workspaceMemberRepository.deactivateMember(workspace, userToRemove);

        if (updatedRows == 0) {
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

    // region Validação
    public boolean canUserAccessWorkspace(Workspace workspace, User user) {
        return workspace.getOwner().equals(user) ||
                workspaceMemberRepository.existsByWorkspaceAndUserAndIsActive(workspace, user, true);
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
                .filter(WorkspaceMember::getIsActive)
                .map(WorkspaceMember::getRole)
                .orElse(null);
    }
    // endregion

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    // region InviteCode

    public Workspace joinWorkspaceByInviteCode(String inviteCode, User user) {
        Workspace workspace = workspaceRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));


        WorkspaceMember newMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(user)
                .role(RoleEnum.MEMBER)
                .isActive(true)
                .build();

        workspaceMemberRepository.save(newMember);

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
    // endregion

}

// Ficheiro: taskifyApplication/service/WorkspaceService.java

package com.taskifyApplication.service;

import com.taskifyApplication.dto.WorkspaceDto.*;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.exception.DuplicateResourceException;
import com.taskifyApplication.exception.ForbiddenException;
import com.taskifyApplication.exception.InvalidFormatException;
import com.taskifyApplication.exception.ResourceNotFoundException;
import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Autowired
    private WorkspaceRepository workspaceRepository;
    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private TimeTrackingRepository timeTrackingRepository;
    @Autowired
    private TaskHistoryRepository taskHistoryRepository;
    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private WorkspaceInvitationRepository workspaceInvitationRepository;
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private ValidationService validationService;
    @Autowired
    private NotificationOrchestratorService notifier;

    // region CRUD
    public Page<WorkspaceNameDTO> getUserWorkspaces(Pageable pageable) {
        User currentUser = getCurrentUser();
        return workspaceRepository.findAllAccessibleByUser(currentUser, pageable);
    }

    public WorkspaceSummaryDTO getWorkspaceSummary(Long id) {
        User currentUser = getCurrentUser();
        if (workspaceRepository.existsById(id) && workspaceRepository.accessibleForUser(currentUser, id)) {
            return convertToWorkspaceSummaryDTO(workspaceRepository.getReferenceById(id));
        } else {
            throw new ResourceNotFoundException("Workspace not found or you dont have access");
        }
    }

    public Workspace getWorkspaceById(Long workspaceId) {
        User currentUser = getCurrentUser();
        if (workspaceRepository.existsById(workspaceId)
                && workspaceRepository.accessibleForUser(currentUser, workspaceId))
        {
            return workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + workspaceId));
        }
        else {
            throw new ResourceNotFoundException("Workspace not found or you dont have access");
        }
    }

    public WorkspaceResponseDTO createWorkspace(CreateWorkspaceDTO createWorkspaceDTO) {
        User owner = getCurrentUser();
        List<Workspace> existingWorkspaces = workspaceRepository.findByOwner(owner);
        boolean nameExists = existingWorkspaces.stream()
                .anyMatch(w -> w.getName().equalsIgnoreCase(createWorkspaceDTO.getName()));

        if (nameExists) {
            throw new DuplicateResourceException("You already have a workspace with this name");
        }

        Workspace workspace = Workspace.builder()
                .name(validationService.sanitizeString(createWorkspaceDTO.getName()))
                .description(validationService.sanitizeHtml(createWorkspaceDTO.getDescription()))
                .owner(owner)
                .inviteCode(generateInviteCode())
                .build();

        workspace.addDefaultStatuses();
        workspace = workspaceRepository.save(workspace);

        WorkspaceMember ownerMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(owner)
                .role(RoleEnum.OWNER)
                .build();

        workspaceMemberRepository.save(ownerMember);

        return convertToWorkspaceResponseDTO(workspace);
    }
    @Transactional
    public void deleteWorkspace(Long workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + workspaceId));
        User user = getCurrentUser();

        if (!workspace.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("Cannot delete workspace if you are not the OWNER");
        }

        List<Task> tasks = taskRepository.findByWorkspace(workspace);
        if (!tasks.isEmpty()) {
            List<Long> taskIds = tasks.stream().map(Task::getId).collect(Collectors.toList());

            entityManager.createQuery("UPDATE Activity a SET a.task = null WHERE a.task.id IN :taskIds")
                    .setParameter("taskIds", taskIds)
                    .executeUpdate();
            timeTrackingRepository.deleteByTaskIdIn(taskIds);

            taskHistoryRepository.deleteByTaskIdIn(taskIds);

            taskRepository.deleteAll(tasks);
        }

        activityRepository.deleteByWorkspaceId(workspaceId);

        List<Category> categories = categoryRepository.getAllCategoriesFromWorkspace(workspaceId);
        if (!categories.isEmpty()) {
            categoryRepository.deleteAll(categories);
        }

        entityManager.createQuery("DELETE FROM Notification n WHERE n.workspace.id = :workspaceId")
                .setParameter("workspaceId", workspaceId)
                .executeUpdate();

        workspaceRepository.delete(workspace);
    }


    public WorkspaceResponseDTO updateWorkspace(UpdateWorkspaceDTO updateWorkspaceDTO) {

        Workspace workspace = workspaceRepository.findById(updateWorkspaceDTO.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
        User user = getCurrentUser();
        if (!workspace.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("Cannot update workspace if you are not the OWNER");
        }
        if(updateWorkspaceDTO.getName() != null && !updateWorkspaceDTO.getName().equals(workspace.getName())) {
            workspace.setName(validationService.sanitizeString(updateWorkspaceDTO.getName()));
        }
        if(updateWorkspaceDTO.getDescription() != null && !updateWorkspaceDTO.getDescription().equals(workspace.getDescription())) {
            workspace.setDescription(validationService.sanitizeHtml(updateWorkspaceDTO.getDescription()));
        }
        workspaceRepository.save(workspace);
        return convertToWorkspaceResponseDTO(workspace);
    }

    public List<WorkspaceNameDTO> getUserWorkspacesList() {
        User currentUser = getCurrentUser();
        return workspaceRepository.findAllAccessibleByUser(currentUser);
    }
    // endregion

    // region MEMBERS CONFIG
    public void inviteUserToWorkspace(Long workspaceId, User userToInvite, RoleEnum role) {
        Workspace workspace = getWorkspaceById(workspaceId);
        User requestingUser = getCurrentUser();

        if (!canUserManageWorkspace(workspace)) {
            throw new ForbiddenException("You don't have permission to invite members to this workspace");
        }

        // Check if user is already a member
        if (workspaceMemberRepository.existsByWorkspaceAndUser(workspace, userToInvite)) {
            throw new DuplicateResourceException("User is already a member of this workspace");
        }

        // Check if there's already a pending invitation
        if (workspaceInvitationRepository.existsByWorkspaceAndInvitedUserAndStatus(
                workspace, userToInvite, WorkspaceInvitation.InvitationStatus.PENDING)) {
            throw new DuplicateResourceException("User already has a pending invitation to this workspace");
        }

        // Create the invitation instead of adding directly
        WorkspaceInvitation invitation = WorkspaceInvitation.builder()
                .workspace(workspace)
                .invitedUser(userToInvite)
                .inviter(requestingUser)
                .proposedRole(role)
                .status(WorkspaceInvitation.InvitationStatus.PENDING)
                .build();

        workspaceInvitationRepository.save(invitation);

        // Send notification and email
        notifier.notifyUserOfWorkspaceInvite(requestingUser, userToInvite, workspace);
    }

    public void addMemberToWorkspace(Long workspaceId, User userToAdd, RoleEnum role) {
        Workspace workspace = getWorkspaceById(workspaceId);

        if (workspaceMemberRepository.existsByWorkspaceAndUser(workspace, userToAdd)) {
            throw new DuplicateResourceException("User is already a member of this workspace");
        }

        WorkspaceMember newMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(userToAdd)
                .role(role)
                .build();

        workspaceMemberRepository.save(newMember);
    }

    @Transactional
    public void respondToInvitation(Long invitationId, boolean accept) {
        User currentUser = getCurrentUser();
        WorkspaceInvitation invitation = workspaceInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getInvitedUser().equals(currentUser)) {
            throw new ForbiddenException("You can only respond to your own invitations");
        }

        if (invitation.getStatus() != WorkspaceInvitation.InvitationStatus.PENDING) {
            throw new InvalidFormatException("This invitation has already been responded to");
        }

        invitation.setRespondedAt(java.time.LocalDateTime.now());

        if (accept) {
            invitation.setStatus(WorkspaceInvitation.InvitationStatus.ACCEPTED);

            // Add user to workspace
            addMemberToWorkspace(invitation.getWorkspace().getId(), currentUser, invitation.getProposedRole());

            // Notify workspace members of new joinee
            notifier.notifyMembersOfNewJoinee(invitation.getWorkspace(), currentUser);
        } else {
            invitation.setStatus(WorkspaceInvitation.InvitationStatus.DECLINED);
        }

        workspaceInvitationRepository.save(invitation);
    }

    public List<WorkspaceInvitationDTO> getPendingInvitations() {
        User currentUser = getCurrentUser();
        List<WorkspaceInvitation> invitations = workspaceInvitationRepository
                .findByInvitedUserAndStatus(currentUser, WorkspaceInvitation.InvitationStatus.PENDING);

        return invitations.stream()
                .map(this::convertToDTO)
                .toList();
    }

    private WorkspaceInvitationDTO convertToDTO(WorkspaceInvitation invitation) {
        return WorkspaceInvitationDTO.builder()
                .id(invitation.getId())
                .workspaceId(invitation.getWorkspace().getId())
                .workspaceName(invitation.getWorkspace().getName())
                .inviterName(invitation.getInviter().getFirstName() + " " + invitation.getInviter().getLastName())
                .inviterEmail(invitation.getInviter().getEmail())
                .proposedRole(invitation.getProposedRole())
                .status(invitation.getStatus())
                .createdAt(invitation.getCreatedAt())
                .respondedAt(invitation.getRespondedAt())
                .build();
    }

    public void removeMemberFromWorkspace(Long workspaceId, User userToRemove) {
        Workspace workspace = getWorkspaceById(workspaceId);
        User requestingUser = getCurrentUser();
        if (!canUserManageWorkspace(workspace)) {
            throw new ForbiddenException("You don't have permission to remove members from this workspace");
        }

        if (workspace.getOwner().equals(userToRemove)) {
            throw new ForbiddenException("Cannot remove workspace owner");
        }

        Optional<WorkspaceMember> memberToRemove = workspaceMemberRepository.findByWorkspaceAndUser(workspace, userToRemove);

        if (memberToRemove.isPresent()) {
            workspaceMemberRepository.delete(memberToRemove.get());
        } else {
            throw new InvalidFormatException("User is not a member of this workspace");
        }
    }

    public void updateMemberRole(Long workspaceId, User userToUpdate, RoleEnum newRole) {
        Workspace workspace = getWorkspaceById(workspaceId);
        User requestingUser = getCurrentUser();
        if (!canUserManageWorkspace(workspace)) {
            throw new ForbiddenException("You don't have permission to update member roles");
        }

        if (workspace.getOwner().equals(userToUpdate)) {
            throw new ForbiddenException("Cannot change workspace owner role");
        }

        int updatedRows = workspaceMemberRepository.updateMemberRole(workspace, userToUpdate, newRole);

        if (updatedRows == 0) {
            throw new InvalidFormatException("User is not an active member of this workspace");
        }
    }
    // endregion

    // region VALIDATION
    public boolean canUserAccessWorkspace(Workspace workspace) {
        User user = getCurrentUser();
        return workspace.getOwner().equals(user) ||
                workspaceMemberRepository.existsByWorkspaceAndUser(workspace, user);
    }

    public boolean canUserManageWorkspace(Workspace workspace) {
        User user = getCurrentUser();
        if (workspace.getOwner().equals(user)) {
            return true;
        }
        RoleEnum userRole = getUserRoleInWorkspace(workspace, user);
        return userRole == RoleEnum.ADMIN || userRole == RoleEnum.OWNER;
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

    public void joinWorkspaceByInviteCode(String inviteCode) {
        User user = getCurrentUser();
        Workspace workspace = workspaceRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new InvalidFormatException("Invalid invite code"));

        if (workspaceMemberRepository.existsByWorkspaceAndUser(workspace, user) || workspace.getOwner().equals(user)) {
            throw new DuplicateResourceException("You are already a member of this workspace");
        }

        WorkspaceMember newMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(user)
                .role(RoleEnum.MEMBER)
                .build();

        workspaceMemberRepository.save(newMember);

        notifier.notifyMembersOfNewJoinee(workspace, user);
    }


    public String generateNewInviteCode(Long workspaceId) {
        Workspace workspace = getWorkspaceById(workspaceId);

        if (!canUserManageWorkspace(workspace)) {
            throw new ForbiddenException("You don't have permission to generate invite codes");
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

        if (!canUserManageWorkspace(workspace)) {
            throw new ForbiddenException("You don't have permission to view invite codes for this workspace");
        }

        return workspace.getInviteCode();
    }

    public List<WorkspaceMembersResponseDTO> getWorkspaceMembers(Long workspaceId) {
        User currentUser = getCurrentUser();
        Workspace workspace = getWorkspaceById(workspaceId);

        if (!canUserAccessWorkspace(workspace)) {
            throw new ForbiddenException("You don't have access to this workspace");
        }

        return workspace.getMembers().stream()
                .map(this::convertToWorkspaceMemberResponseDTO)
                .collect(Collectors.toList());
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
        WorkspaceSummaryDTO workspaceSummaryDTO = new WorkspaceSummaryDTO();
        workspaceSummaryDTO.setName(workspace.getName());
        workspaceSummaryDTO.setDescription(workspace.getDescription());
        workspaceSummaryDTO.setCreatedAt(workspace.getCreatedAt());
        workspaceSummaryDTO.setOwnerName(workspace.getOwner().getFirstName() + " " + workspace.getOwner().getLastName());
        workspaceSummaryDTO.setMemberCount(workspace.getMembers().size());
        workspaceSummaryDTO.setTaskCount(taskRepository.findByWorkspace(workspace).size());
        return workspaceSummaryDTO;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private WorkspaceMembersResponseDTO convertToWorkspaceMemberResponseDTO(WorkspaceMember member) {
        WorkspaceMembersResponseDTO dto = new WorkspaceMembersResponseDTO();
        dto.setId(member.getId());
        dto.setUser(convertToUserSummaryDTO(member.getUser()));
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        dto.setOwner(member.getRole() == RoleEnum.OWNER);
        return dto;
    }

    private UserSummaryDTO convertToUserSummaryDTO(User user) {
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        return dto;
    }
    //endregion
}
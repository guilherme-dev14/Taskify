package com.taskifyApplication.service;

import com.taskifyApplication.exception.BadRequestException;
import com.taskifyApplication.exception.ForbiddenException;
import com.taskifyApplication.exception.ResourceNotFoundException;
import com.taskifyApplication.model.Notification;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public Notification createNotification(Notification.NotificationType type, String title, String message,
                                           User user, Workspace workspace, Task task, String actionUrl,
                                           Map<String, String> metadata) {
        Notification notification = Notification.builder()
                .type(type)
                .title(title)
                .message(message)
                .user(user)
                .workspace(workspace)
                .task(task)
                .actionUrl(actionUrl)
                .metadata(metadata != null ? metadata : new HashMap<>())
                .read(false)
                .build();

        return notificationRepository.save(notification);
    }

    public Page<Notification> getUserNotifications(Boolean read, String type, Long workspaceId, Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        Notification.NotificationType notificationType = null;
        if (type != null && !type.isEmpty()) {
            try {
                notificationType = Notification.NotificationType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid notification type: " + type);
            }
        }
        return notificationRepository.findWithFilters(currentUser, read, notificationType, workspaceId, pageable);
    }

    public Long getUnreadCount() {
        User currentUser = userService.getCurrentUser();
        return notificationRepository.countUnreadByUser(currentUser);
    }

    public void markAsRead(Long notificationId) {
        User currentUser = userService.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().equals(currentUser)) {
            throw new ForbiddenException("You do not have permission to access this notification.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead() {
        User currentUser = userService.getCurrentUser();
        notificationRepository.markAllAsReadForUser(currentUser);
    }

    public void deleteNotification(Long notificationId) {
        User currentUser = userService.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().equals(currentUser)) {
            throw new ForbiddenException("You do not have permission to delete this notification.");
        }

        notificationRepository.delete(notification);
    }

    public List<Notification> getRecentUnreadNotifications(User user, OffsetDateTime since) {
        return notificationRepository.findRecentUnreadByUser(user, since);
    }

    public void cleanupOldNotifications(OffsetDateTime cutoffDate) {
        notificationRepository.deleteOldNotifications(cutoffDate);
    }

    public void notifyTaskAssigned(User assignedUser, Task task, User assignedBy) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("assignedBy", assignedBy.getId().toString());
        metadata.put("assignedByName", assignedBy.getFirstName() + " " + assignedBy.getLastName());
        String actionUrl = "/tasks/" + task.getId();
        createNotification(
                Notification.NotificationType.TASK_ASSIGNED,
                "New Task Assigned",
                String.format("You have been assigned to task: %s", task.getTitle()),
                assignedUser,
                task.getWorkspace(),
                task,
                actionUrl,
                metadata
        );
    }

    public void notifyTaskUpdated(User userToNotify, Task task, User updatedBy, String changeDescription) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("updatedBy", updatedBy.getId().toString());
        metadata.put("updatedByName", updatedBy.getFirstName() + " " + updatedBy.getLastName());
        metadata.put("changeDescription", changeDescription);
        createNotification(
                Notification.NotificationType.TASK_UPDATED,
                "Task Updated",
                String.format("Task '%s' has been updated: %s", task.getTitle(), changeDescription),
                userToNotify,
                task.getWorkspace(),
                task,
                "/tasks/" + task.getId(),
                metadata
        );
    }

    public void notifyTaskDue(User assignedUser, Task task) {
        createNotification(
                Notification.NotificationType.TASK_DUE,
                "Task Due Soon",
                String.format("Task '%s' is due soon", task.getTitle()),
                assignedUser,
                task.getWorkspace(),
                task,
                "/tasks/" + task.getId(),
                null
        );
    }

    public void notifyWorkspaceInvite(User invitedUser, Workspace workspace, User invitedBy) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("invitedBy", invitedBy.getId().toString());
        metadata.put("invitedByName", invitedBy.getFirstName() + " " + invitedBy.getLastName());
        createNotification(
                Notification.NotificationType.WORKSPACE_INVITE,
                "Workspace Invitation",
                String.format("You have been invited to join '%s' workspace", workspace.getName()),
                invitedUser,
                workspace,
                null,
                String.format("/workspace/%d", workspace.getId()),
                metadata
        );
    }

    public void notifyMemberJoined(User existingMember, Workspace workspace, User newMember) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("newMemberId", newMember.getId().toString());
        metadata.put("newMemberName", newMember.getFirstName() + " " + newMember.getLastName());
        createNotification(
                Notification.NotificationType.MEMBER_JOINED,
                "New Member Joined",
                String.format("%s %s joined the workspace '%s'",
                        newMember.getFirstName(), newMember.getLastName(), workspace.getName()),
                existingMember,
                workspace,
                null,
                String.format("/workspace/%d", workspace.getId()),
                metadata
        );
    }

    public void notifyTaskCompleted(User userToNotify, Task task, User completedBy) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("completedBy", completedBy.getId().toString());
        metadata.put("completedByName", completedBy.getFirstName() + " " + completedBy.getLastName());
        createNotification(
                Notification.NotificationType.TASK_COMPLETED,
                "Task Completed",
                String.format("Task '%s' has been completed by %s %s",
                        task.getTitle(), completedBy.getFirstName(), completedBy.getLastName()),
                userToNotify,
                task.getWorkspace(),
                task,
                "/tasks/" + task.getId(),
                metadata
        );
    }
}
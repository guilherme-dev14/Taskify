package com.taskifyApplication.service;

import com.taskifyApplication.exception.BadRequestException;
import com.taskifyApplication.exception.ForbiddenException;
import com.taskifyApplication.exception.ResourceNotFoundException;
import com.taskifyApplication.model.Notification;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import com.taskifyApplication.model.Workspace;
import com.taskifyApplication.repository.NotificationRepository;
import com.taskifyApplication.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

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

    public Page<Notification> getUserNotifications(User user, Boolean read, Notification.NotificationType type,
                                                  Long workspaceId, Pageable pageable) {
        return notificationRepository.findWithFilters(user, read, type, workspaceId, pageable);
    }
    public Long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUser(user);
    }

    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().equals(user)) {
            throw new ForbiddenException("Cannot mark another user's notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user);
    }

    public void markAsRead(List<Long> notificationIds, User user) {
        List<Notification> notifications = notificationRepository.findAllById(notificationIds);
        boolean allBelongToUser = notifications.stream()
                .allMatch(n -> n.getUser().equals(user));

        if (!allBelongToUser) {
            throw new ForbiddenException("Cannot mark notifications that don't belong to you");
        }

        notificationRepository.markAsReadByIds(notificationIds);
    }

    // Delete notification
    public void deleteNotification(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().equals(user)) {
            throw new ForbiddenException("Cannot delete another user's notification");
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
                    null,
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
                    null,
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
                    null,
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
                    null,
                    task,
                    "/tasks/" + task.getId(),
                    metadata
            );
    }
}
package com.taskifyApplication.service;

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

    // Create notification
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

    // Get user notifications with pagination and filters
    public Page<Notification> getUserNotifications(User user, Boolean read, Notification.NotificationType type,
                                                  Long workspaceId, Pageable pageable) {
        return notificationRepository.findWithFilters(user, read, type, workspaceId, pageable);
    }

    // Get unread count
    public Long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUser(user);
    }

    // Mark notification as read
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUser().equals(user)) {
            throw new IllegalArgumentException("Cannot mark another user's notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // Mark all as read
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user);
    }

    // Mark multiple as read
    public void markAsRead(List<Long> notificationIds, User user) {
        // Verify all notifications belong to the user
        List<Notification> notifications = notificationRepository.findAllById(notificationIds);
        boolean allBelongToUser = notifications.stream()
                .allMatch(n -> n.getUser().equals(user));

        if (!allBelongToUser) {
            throw new IllegalArgumentException("Cannot mark notifications that don't belong to you");
        }

        notificationRepository.markAsReadByIds(notificationIds);
    }

    // Delete notification
    public void deleteNotification(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUser().equals(user)) {
            throw new IllegalArgumentException("Cannot delete another user's notification");
        }

        notificationRepository.delete(notification);
    }

    // Get recent unread notifications
    public List<Notification> getRecentUnreadNotifications(User user, OffsetDateTime since) {
        return notificationRepository.findRecentUnreadByUser(user, since);
    }

    // Cleanup old notifications (for scheduled task)
    public void cleanupOldNotifications(OffsetDateTime cutoffDate) {
        notificationRepository.deleteOldNotifications(cutoffDate);
    }

    // Helper methods for common notification types

    public void notifyTaskAssigned(User assignedUser, Task task, User assignedBy) {
        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("assignedBy", assignedBy.getId().toString());
            metadata.put("assignedByName", assignedBy.getFirstName() + " " + assignedBy.getLastName());

            // For safety, don't reference workspace in notifications to avoid foreign key issues
            // Use simple action URL without workspace reference
            String actionUrl = "/tasks/" + task.getId();

            createNotification(
                    Notification.NotificationType.TASK_ASSIGNED,
                    "New Task Assigned",
                    String.format("You have been assigned to task: %s", task.getTitle()),
                    assignedUser,
                    null, // Don't reference workspace to avoid foreign key constraint
                    task,
                    actionUrl,
                    metadata
            );
        } catch (Exception e) {
            System.out.println("ERROR: Failed to create task assignment notification: " + e.getMessage());
            e.printStackTrace();
            // Don't re-throw the exception to avoid breaking the main task update operation
        }
    }

    public void notifyTaskUpdated(User userToNotify, Task task, User updatedBy, String changeDescription) {
        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("updatedBy", updatedBy.getId().toString());
            metadata.put("updatedByName", updatedBy.getFirstName() + " " + updatedBy.getLastName());
            metadata.put("changeDescription", changeDescription);

            createNotification(
                    Notification.NotificationType.TASK_UPDATED,
                    "Task Updated",
                    String.format("Task '%s' has been updated: %s", task.getTitle(), changeDescription),
                    userToNotify,
                    null, // Don't reference workspace to avoid foreign key constraint
                    task,
                    "/tasks/" + task.getId(),
                    metadata
            );
        } catch (Exception e) {
            System.out.println("ERROR: Failed to create task update notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void notifyTaskDue(User assignedUser, Task task) {
        try {
            createNotification(
                    Notification.NotificationType.TASK_DUE,
                    "Task Due Soon",
                    String.format("Task '%s' is due soon", task.getTitle()),
                    assignedUser,
                    null, // Don't reference workspace to avoid foreign key constraint
                    task,
                    "/tasks/" + task.getId(),
                    null
            );
        } catch (Exception e) {
            System.out.println("ERROR: Failed to create task due notification: " + e.getMessage());
            e.printStackTrace();
        }
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
        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("completedBy", completedBy.getId().toString());
            metadata.put("completedByName", completedBy.getFirstName() + " " + completedBy.getLastName());

            createNotification(
                    Notification.NotificationType.TASK_COMPLETED,
                    "Task Completed",
                    String.format("Task '%s' has been completed by %s %s", 
                                 task.getTitle(), completedBy.getFirstName(), completedBy.getLastName()),
                    userToNotify,
                    null, // Don't reference workspace to avoid foreign key constraint
                    task,
                    "/tasks/" + task.getId(),
                    metadata
            );
        } catch (Exception e) {
            System.out.println("ERROR: Failed to create task completed notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
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

    public void createNotification(Notification.NotificationType type, String title, String message,
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

        notificationRepository.save(notification);
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
}
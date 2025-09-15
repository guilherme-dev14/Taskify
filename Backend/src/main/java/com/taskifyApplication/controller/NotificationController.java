package com.taskifyApplication.controller;

import com.taskifyApplication.dto.NotificationDto.NotificationPreferencesDTO;
import com.taskifyApplication.model.Notification;
import com.taskifyApplication.model.User;
import com.taskifyApplication.service.NotificationService;
import com.taskifyApplication.service.NotificationPreferencesService;
import com.taskifyApplication.service.UserService;
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

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationPreferencesService notificationPreferencesService;

    @Autowired
    private UserService userService;

    // Get notifications with pagination and filters
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean read,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long workspaceId) {
        try {
            User currentUser = userService.getCurrentUser();
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            Notification.NotificationType notificationType = null;
            if (type != null && !type.isEmpty()) {
                try {
                    notificationType = Notification.NotificationType.valueOf(type.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().build();
                }
            }
            
            Page<Notification> notifications = notificationService.getUserNotifications(
                    currentUser, read, notificationType, workspaceId, pageable);
            
            Long unreadCount = notificationService.getUnreadCount(currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", notifications.getContent());
            response.put("totalElements", notifications.getTotalElements());
            response.put("unreadCount", unreadCount);
            response.put("page", notifications.getNumber());
            response.put("totalPages", notifications.getTotalPages());
            response.put("size", notifications.getSize());
            response.put("first", notifications.isFirst());
            response.put("last", notifications.isLast());
            response.put("empty", notifications.isEmpty());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get unread count only
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        try {
            User currentUser = userService.getCurrentUser();
            Long count = notificationService.getUnreadCount(currentUser);
            
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Mark single notification as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        try {
            User currentUser = userService.getCurrentUser();
            notificationService.markAsRead(id, currentUser);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Mark all notifications as read
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        try {
            User currentUser = userService.getCurrentUser();
            notificationService.markAllAsRead(currentUser);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        try {
            User currentUser = userService.getCurrentUser();
            notificationService.deleteNotification(id, currentUser);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "notification");
        return ResponseEntity.ok(response);
    }

    // Notification preferences endpoints
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferencesDTO> getNotificationPreferences() {
        try {
            NotificationPreferencesDTO preferences = notificationPreferencesService.getUserPreferences();
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferencesDTO> updateNotificationPreferences(
            @Valid @RequestBody NotificationPreferencesDTO preferencesDTO) {
        try {
            NotificationPreferencesDTO updatedPreferences = 
                notificationPreferencesService.updateUserPreferences(preferencesDTO);
            return ResponseEntity.ok(updatedPreferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
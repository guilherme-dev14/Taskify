package com.taskifyApplication.controller;

import com.taskifyApplication.dto.NotificationDto.NotificationPageDTO;
import com.taskifyApplication.dto.NotificationDto.NotificationPreferencesDTO;
import com.taskifyApplication.model.Notification;
import com.taskifyApplication.service.NotificationPreferencesService;
import com.taskifyApplication.service.NotificationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationPreferencesService notificationPreferencesService;

    @GetMapping
    public ResponseEntity<NotificationPageDTO> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean read,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long workspaceId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notifications = notificationService.getUserNotifications(read, type, workspaceId, pageable);
        Long unreadCount = notificationService.getUnreadCount();
        NotificationPageDTO response = new NotificationPageDTO(notifications, unreadCount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferencesDTO> getNotificationPreferences() {
        NotificationPreferencesDTO preferences = notificationPreferencesService.getUserPreferences();
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferencesDTO> updateNotificationPreferences(
            @Valid @RequestBody NotificationPreferencesDTO preferencesDTO) {
        NotificationPreferencesDTO updatedPreferences =
                notificationPreferencesService.updateUserPreferences(preferencesDTO);
        return ResponseEntity.ok(updatedPreferences);
    }
}
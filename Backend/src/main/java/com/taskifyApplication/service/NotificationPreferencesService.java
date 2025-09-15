package com.taskifyApplication.service;

import com.taskifyApplication.dto.NotificationDto.NotificationPreferencesDTO;
import com.taskifyApplication.model.NotificationPreferences;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.NotificationPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationPreferencesService {

    @Autowired
    private NotificationPreferencesRepository notificationPreferencesRepository;

    @Autowired
    private UserService userService;

    public NotificationPreferencesDTO getUserPreferences() {
        User currentUser = userService.getCurrentUser();
        NotificationPreferences preferences = notificationPreferencesRepository.findByUserId(currentUser.getId())
            .orElseGet(() -> createDefaultPreferences(currentUser));
        
        return convertToDTO(preferences);
    }

    public NotificationPreferencesDTO updateUserPreferences(NotificationPreferencesDTO preferencesDTO) {
        User currentUser = userService.getCurrentUser();
        NotificationPreferences preferences = notificationPreferencesRepository.findByUserId(currentUser.getId())
            .orElseGet(() -> createDefaultPreferences(currentUser));

        // Update preferences
        if (preferencesDTO.getEmailNotifications() != null) {
            preferences.setEmailNotifications(preferencesDTO.getEmailNotifications());
        }
        if (preferencesDTO.getPushNotifications() != null) {
            preferences.setPushNotifications(preferencesDTO.getPushNotifications());
        }
        if (preferencesDTO.getTaskAssignments() != null) {
            preferences.setTaskAssignments(preferencesDTO.getTaskAssignments());
        }
        if (preferencesDTO.getTaskUpdates() != null) {
            preferences.setTaskUpdates(preferencesDTO.getTaskUpdates());
        }
        if (preferencesDTO.getDueDates() != null) {
            preferences.setDueDates(preferencesDTO.getDueDates());
        }
        if (preferencesDTO.getWorkspaceUpdates() != null) {
            preferences.setWorkspaceUpdates(preferencesDTO.getWorkspaceUpdates());
        }
        if (preferencesDTO.getComments() != null) {
            preferences.setComments(preferencesDTO.getComments());
        }
        if (preferencesDTO.getDigestEmail() != null) {
            preferences.setDigestEmail(preferencesDTO.getDigestEmail());
        }

        NotificationPreferences savedPreferences = notificationPreferencesRepository.save(preferences);
        return convertToDTO(savedPreferences);
    }

    private NotificationPreferences createDefaultPreferences(User user) {
        return NotificationPreferences.builder()
            .user(user)
            .emailNotifications(true)
            .pushNotifications(true)
            .taskAssignments(true)
            .taskUpdates(true)
            .dueDates(true)
            .workspaceUpdates(true)
            .comments(true)
            .digestEmail(NotificationPreferences.DigestFrequency.DAILY)
            .build();
    }

    private NotificationPreferencesDTO convertToDTO(NotificationPreferences preferences) {
        NotificationPreferencesDTO dto = new NotificationPreferencesDTO();
        dto.setId(preferences.getId());
        dto.setEmailNotifications(preferences.getEmailNotifications());
        dto.setPushNotifications(preferences.getPushNotifications());
        dto.setTaskAssignments(preferences.getTaskAssignments());
        dto.setTaskUpdates(preferences.getTaskUpdates());
        dto.setDueDates(preferences.getDueDates());
        dto.setWorkspaceUpdates(preferences.getWorkspaceUpdates());
        dto.setComments(preferences.getComments());
        dto.setDigestEmail(preferences.getDigestEmail());
        return dto;
    }
}
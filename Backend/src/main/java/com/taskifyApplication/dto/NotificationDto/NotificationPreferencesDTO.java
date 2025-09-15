package com.taskifyApplication.dto.NotificationDto;

import com.taskifyApplication.model.NotificationPreferences;
import lombok.Data;

@Data
public class NotificationPreferencesDTO {
    private Long id;

    private Boolean emailNotifications;

    private Boolean pushNotifications;

    private Boolean taskAssignments;

    private Boolean taskUpdates;

    private Boolean dueDates;

    private Boolean workspaceUpdates;

    private Boolean comments;

    private NotificationPreferences.DigestFrequency digestEmail;
}
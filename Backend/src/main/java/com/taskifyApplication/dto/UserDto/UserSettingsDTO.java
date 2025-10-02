package com.taskifyApplication.dto.UserDto;

import lombok.Data;

@Data
public class UserSettingsDTO {
    private String theme;
    private String language;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean weeklyReports;
    private Boolean taskReminders;
    private Boolean teamUpdates;
}
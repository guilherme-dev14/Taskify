package com.taskifyApplication.dto.UserDto;

import lombok.Data;

@Data
public class UserSettingsDTO {
    private String theme;
    private String language;
    private String timezone;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean weeklyReports;
    private Boolean taskReminders;
    private Boolean teamUpdates;
    private Boolean autoSave;
    private Boolean compactView;
    private Boolean showAvatars;
    private String defaultWorkspace;
    private Boolean taskAutoAssign;
    private String workspacePrivacy;
}
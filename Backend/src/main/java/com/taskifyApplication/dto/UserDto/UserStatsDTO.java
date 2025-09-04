package com.taskifyApplication.dto.UserDto;

import lombok.Data;

@Data
public class UserStatsDTO {
    private int tasksCompleted;
    private int projectsActive;
    private int teamMembers;
    private int totalWorkspaces;
}
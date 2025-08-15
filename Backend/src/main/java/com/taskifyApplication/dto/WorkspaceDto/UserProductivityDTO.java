package com.taskifyApplication.dto.WorkspaceDto;


import lombok.Data;

@Data
public class UserProductivityDTO {
    private UserSummaryDTO user;
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer overdueTasks;
    private Double completionRate;
    private Integer averageCompletionDays;
}
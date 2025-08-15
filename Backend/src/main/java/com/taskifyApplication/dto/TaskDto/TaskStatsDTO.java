package com.taskifyApplication.dto.TaskDto;


import lombok.Data;

@Data
public class TaskStatsDTO {
    private Long totalTasks;
    private Long newTasks;
    private Long inProgressTasks;
    private Long completedTasks;
    private Long cancelledTasks;
    private Long overdueTasks;
    private Long dueSoonTasks;
    private Double completionRate;
    private Integer averageCompletionDays;
}

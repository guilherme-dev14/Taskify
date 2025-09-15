package com.taskifyApplication.dto.TaskDto;

import lombok.Data;

@Data
public class DashboardStatsDTO {

    private Integer totalTasks;
    private Integer toDoToday;
    private Integer inProgress;
    private Integer overdue;
    private Integer totalEstimatedHours;
    private Integer totalActualHours;
    private Integer completedTasksEstimatedHours;
    private Double estimatedVsActualRatio;
}

package com.taskifyApplication.dto.TaskDto;

import lombok.Data;

@Data
public class DashboardStatsDTO {

    private Integer totalTasks;
    private Integer toDoToday;
    private Integer inProgress;
    private Integer overdue;
}

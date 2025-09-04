package com.taskifyApplication.dto.TimeTrackingDto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class TaskTimeReportDTO {
    private Long taskId;
    private String taskTitle;
    private String taskStatus;
    private Long totalMinutes;
    private String totalTimeFormatted;
    private Integer sessionCount;
    private String workspaceName;
}
package com.taskifyApplication.dto.TimeTrackingDto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class TimeTrackingResponseDTO {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private Long userId;
    private String userName;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Integer duration; // in minutes
    private String description;
    private Boolean isActive;
    private String workspaceName;
    private Long workspaceId;
}
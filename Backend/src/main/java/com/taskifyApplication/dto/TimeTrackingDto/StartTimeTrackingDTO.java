package com.taskifyApplication.dto.TimeTrackingDto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartTimeTrackingDTO {
    @NotNull(message = "Task ID is required")
    private Long taskId;
    
    private String description;
}
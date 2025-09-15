package com.taskifyApplication.dto.TimeTrackingDto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TimeTrackingRequestDTO {
    @NotNull(message = "Task ID is required")
    private Long taskId;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
}
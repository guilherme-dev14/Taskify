package com.taskifyApplication.dto.TimeTrackingDto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class TimeTrackingUpdateDTO {
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
}
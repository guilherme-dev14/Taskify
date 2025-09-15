package com.taskifyApplication.dto.TimeTrackingDto;

import com.taskifyApplication.dto.TaskDto.TaskResponseDTO;
import com.taskifyApplication.dto.UserDto.UserDTO;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class TimeTrackingResponseDTO {
    private Long id;
    private TaskResponseDTO task;
    private UserDTO user;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Integer duration;
    private String description;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String formattedDuration;
    private Integer currentDuration;
}
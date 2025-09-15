package com.taskifyApplication.dto.TaskDto;


import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class AssignTaskDTO {
    @NotNull(message = "User ID is required")
    private Long userId;
}

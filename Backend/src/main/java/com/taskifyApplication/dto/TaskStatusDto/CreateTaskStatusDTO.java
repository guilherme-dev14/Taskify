package com.taskifyApplication.dto.TaskStatusDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTaskStatusDTO {

    @NotBlank(message = "Name is required")
    @Size(max = 50, message = "Status name must not exceed 50 characters")
    private String name;

    @Size(max = 20, message = "Color hex code must not exceed 20 characters")
    private String color;

    @NotNull(message = "Workspace ID is required")
    private Long workspaceId;
}

package com.taskifyApplication.dto.WorkspaceDto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class CreateWorkspaceDTO {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

}

package com.taskifyApplication.dto.WorkspaceDto;

import lombok.Data;
import jakarta.validation.constraints.Size;

@Data
public class UpdateWorkspaceDTO {
    private Long id;
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")

    private String description;
}
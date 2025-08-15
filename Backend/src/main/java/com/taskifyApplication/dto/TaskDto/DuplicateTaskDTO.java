package com.taskifyApplication.dto.TaskDto;


import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class DuplicateTaskDTO {
    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    private Boolean includeDueDate = false;
    private Boolean includeAssignee = false;
    private Boolean includeDescription = true;
}
package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.model.PriorityEnum;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateTaskDTO {
    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Workspace ID is required")
    private Long workspaceId;

    private List<Long> categoryIds;

    private Long assignedToId;

    private PriorityEnum priority;

    private LocalDateTime dueDate;
}


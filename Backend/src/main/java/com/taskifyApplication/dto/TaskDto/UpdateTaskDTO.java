package com.taskifyApplication.dto.TaskDto;

import com.taskifyApplication.model.PriorityEnum;
import lombok.Data;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdateTaskDTO {
    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private String notes;

    private List<Long> categoryIds;
    private Long assignedToId;
    private PriorityEnum priority;
    private Long statusId;
    private LocalDateTime dueDate;
    private Integer estimatedHours;
    private Integer actualHours;
    private Long workspaceId;

}

package com.taskifyApplication.dto.TaskDto;

import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.model.StatusTaskEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateSubtaskDTO {
    @NotNull(message = "Parent task ID is required")
    private Long parentTaskId;
    
    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;
    
    private String description;
    private StatusTaskEnum status = StatusTaskEnum.NEW;
    private PriorityEnum priority = PriorityEnum.MEDIUM;
    private LocalDateTime dueDate;
    private Long assignedToId;
    private List<Long> categoryIds;
    private Integer estimatedHours;
}
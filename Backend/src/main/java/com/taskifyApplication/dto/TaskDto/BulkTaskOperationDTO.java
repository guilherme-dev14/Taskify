package com.taskifyApplication.dto.TaskDto;

import com.taskifyApplication.dto.TaskStatusDto.TaskStatusDTO;
import com.taskifyApplication.model.PriorityEnum;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class BulkTaskOperationDTO {
    @NotEmpty(message = "Task IDs are required")
    private List<Long> taskIds;
    
    // Fields that can be updated in bulk
    private Long statusId;
    private PriorityEnum priority;
    private Long assignedToId;
    private List<Long> categoryIds;
}
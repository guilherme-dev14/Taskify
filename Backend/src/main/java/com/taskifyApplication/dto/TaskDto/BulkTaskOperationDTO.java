package com.taskifyApplication.dto.TaskDto;

import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.model.StatusTaskEnum;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class BulkTaskOperationDTO {
    @NotEmpty(message = "Task IDs are required")
    private List<Long> taskIds;
    
    // Fields that can be updated in bulk
    private StatusTaskEnum status;
    private PriorityEnum priority;
    private Long assignedToId;
    private List<Long> categoryIds;
}
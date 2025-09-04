package com.taskifyApplication.dto.TaskDependencyDto;

import com.taskifyApplication.model.TaskDependency;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTaskDependencyDTO {
    @NotNull(message = "Task ID is required")
    private Long taskId;
    
    @NotNull(message = "Depends on Task ID is required")
    private Long dependsOnTaskId;
    
    private TaskDependency.DependencyType type = TaskDependency.DependencyType.FINISH_TO_START;
}
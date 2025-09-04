package com.taskifyApplication.dto.TaskDependencyDto;

import com.taskifyApplication.dto.TaskDto.TaskSummaryDTO;
import com.taskifyApplication.model.TaskDependency;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class TaskDependencyResponseDTO {
    private Long id;
    private TaskSummaryDTO task;
    private TaskSummaryDTO dependsOnTask;
    private TaskDependency.DependencyType type;
    private OffsetDateTime createdAt;
    private Boolean isBlocking;
    private String dependencyStatus; // "SATISFIED", "PENDING", "BLOCKED"
}
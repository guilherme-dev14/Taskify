package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.dto.CategoryDto.CategorySummaryDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceSummaryDTO;
import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.model.StatusTaskEnum;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private StatusTaskEnum status;
    private PriorityEnum priority;
    private LocalDateTime dueDate;
    private OffsetDateTime createdAt;

    private WorkspaceSummaryDTO workspace;
    private CategorySummaryDTO category;
    private UserSummaryDTO assignedTo;
    private UserSummaryDTO createdBy;

    private Integer commentsCount;
    private Boolean isOverdue;
    private Integer daysUntilDue;
}
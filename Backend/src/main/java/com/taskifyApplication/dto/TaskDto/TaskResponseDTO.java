package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceSummaryDTO;
import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.model.StatusTaskEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private StatusTaskEnum status;
    private PriorityEnum priority;
    private LocalDateTime dueDate;
    private OffsetDateTime createdAt;

    private WorkspaceSummaryDTO workspace;
    private CategoryResponseDTO category;
    private UserSummaryDTO assignedTo;
    private UserSummaryDTO createdBy;

    private Integer commentsCount;
    private Boolean isOverdue;
    private Integer daysUntilDue;
}
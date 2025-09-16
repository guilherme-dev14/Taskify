package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.TaskStatusDto.TaskStatusDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceNameDTO;
import com.taskifyApplication.dto.AttachmentDto.AttachmentResponseDTO;
import com.taskifyApplication.model.ChecklistItem;
import com.taskifyApplication.model.PriorityEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private TaskStatusDTO status;
    private PriorityEnum priority;
    private LocalDateTime dueDate;
    private OffsetDateTime createdAt;

    private WorkspaceNameDTO workspace;
    private List<CategoryResponseDTO> categories;
    private UserSummaryDTO assignedTo;
    private UserSummaryDTO createdBy;

    private Integer commentsCount;
    private Boolean isOverdue;
    private Integer daysUntilDue;
    private String notes;
    private Integer estimatedHours;
    private Integer actualHours;
    private List<AttachmentResponseDTO> attachments;
    private List<ChecklistItem> checklist;
}
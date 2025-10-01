package com.taskifyApplication.dto.TaskDto;

import com.taskifyApplication.dto.AttachmentDto.AttachmentResponseDTO;
import com.taskifyApplication.dto.CategoryDto.CategoryResponseDTO;
import com.taskifyApplication.dto.TaskStatusDto.TaskStatusDTO;
import com.taskifyApplication.dto.UserDto.UserDTO;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceResponseDTO;
import com.taskifyApplication.model.PriorityEnum;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class TaskDetailDTO {
    private Long id;
    private String title;
    private String description;
    private String notes;
    private TaskStatusDTO status;
    private PriorityEnum priority;
    private LocalDateTime dueDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private WorkspaceResponseDTO workspace;
    private List<CategoryResponseDTO> categories;
    private UserDTO assignedTo;
    private UserDTO createdBy;

    private List<TaskHistoryDTO> history;
    private List<AttachmentResponseDTO> attachments;

    private Integer commentsCount;
    private Boolean isOverdue;
    private Integer daysUntilDue;
    private Integer estimatedHours;
    private Integer actualHours;
}

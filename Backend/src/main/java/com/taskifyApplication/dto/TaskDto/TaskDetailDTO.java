package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.model.StatusTaskEnum;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class TaskDetailDTO {
    private Long id;
    private String title;
    private String description;
    private StatusTaskEnum status;
    private PriorityEnum priority;
    private LocalDateTime dueDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private WorkspaceResponseDTO workspace;
    private CategoryResponseDTO category;
    private UserProfileDTO assignedTo;
    private UserProfileDTO createdBy;

    private List<CommentResponseDTO> comments;
    private List<TaskHistoryDTO> history;

    private Integer commentsCount;
    private Boolean isOverdue;
    private Integer daysUntilDue;
    private Integer estimatedHours;
    private Integer actualHours;
}

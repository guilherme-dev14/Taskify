package com.taskifyApplication.dto.TaskDto;

import com.taskifyApplication.dto.TaskStatusDto.TaskStatusDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.model.PriorityEnum;
import lombok.Data;
import com.taskifyApplication.dto.WorkspaceDto.WorkspaceNameDTO;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskSummaryDTO {
    private Long id;
    private String title;
    private String description;
    private TaskStatusDTO status;
    private PriorityEnum priority;
    private LocalDateTime dueDate;
    private String assignedToName;
    private UserSummaryDTO assignedTo;
    private List<String> categoryNames;
    private Integer progress;
    private boolean hasAttachments;
    private WorkspaceNameDTO workspace;
}

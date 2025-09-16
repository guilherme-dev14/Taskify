package com.taskifyApplication.dto.TaskDto;

import com.taskifyApplication.model.PriorityEnum;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdvancedSearchDTO {
    private String searchTerm; // For title and description
    private List<Long> workspaceIds;
    private List<Long> statusesId;
    private List<PriorityEnum> priorities;
    private List<Long> assignedToIds;
    private List<Long> categoryIds;
    private List<String> tags;
    
    // Date filters
    private LocalDateTime dueDateFrom;
    private LocalDateTime dueDateTo;
    private LocalDateTime createdDateFrom;
    private LocalDateTime createdDateTo;
    
    // Additional filters
    private Boolean hasAttachments;
    private Boolean isOverdue;
    private Boolean hasSubtasks;
}
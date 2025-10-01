package com.taskifyApplication.dto.TaskDto;

import com.taskifyApplication.model.PriorityEnum;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdvancedSearchDTO {
    private String searchTerm;
    private List<Long> workspaceIds;
    private List<Long> statusesId;
    private List<PriorityEnum> priorities;
    private List<Long> assignedToIds;
    private List<Long> categoryIds;
    private List<String> tags;

    private LocalDateTime dueDateFrom;
    private LocalDateTime dueDateTo;
    private LocalDateTime createdDateFrom;
    private LocalDateTime createdDateTo;

    private Boolean hasAttachments;
    private Boolean isOverdue;
    private Boolean hasSubtasks;
}
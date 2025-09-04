package com.taskifyApplication.dto.TaskTemplateDto;

import com.taskifyApplication.model.PriorityEnum;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class TaskTemplateResponseDTO {
    private Long id;
    private String name;
    private String description;
    private String defaultTitle;
    private String defaultDescription;
    private PriorityEnum defaultPriority;
    private Integer defaultEstimatedHours;
    private List<String> defaultTags;
    private List<String> categoryNames;
    private List<String> checklistItems;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String createdByName;
    private String workspaceName;
}
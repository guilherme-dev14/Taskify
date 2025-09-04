package com.taskifyApplication.dto.TaskTemplateDto;

import com.taskifyApplication.model.PriorityEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateTaskTemplateDTO {
    @NotBlank(message = "Template name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Workspace ID is required")
    private Long workspaceId;
    
    @NotBlank(message = "Default title is required")
    private String defaultTitle;
    
    private String defaultDescription;
    private PriorityEnum defaultPriority = PriorityEnum.MEDIUM;
    private Integer defaultEstimatedHours;
    private List<String> defaultTags;
    private List<Long> categoryIds;
    private List<String> defaultChecklistItems;
}
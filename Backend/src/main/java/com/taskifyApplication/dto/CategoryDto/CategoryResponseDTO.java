package com.taskifyApplication.dto.CategoryDto;


import com.taskifyApplication.dto.WorkspaceDto.WorkspaceSummaryDTO;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class CategoryResponseDTO {
    private Long id;
    private String name;
    private String description;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private UserSummaryDTO owner;
    private WorkspaceSummaryDTO workspace;

    private Integer taskCount;
    private Integer completedTaskCount;
    private Integer overdueTaskCount;
}


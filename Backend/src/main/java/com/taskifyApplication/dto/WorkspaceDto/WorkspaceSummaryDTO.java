package com.taskifyApplication.dto.WorkspaceDto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class WorkspaceSummaryDTO {
    private String name;
    private String description;
    private OffsetDateTime createdAt;
    private String ownerName;
    private Integer memberCount;
    private Integer taskCount;
}

package com.taskifyApplication.dto.WorkspaceDto;



import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class WorkspaceResponseDTO {
    private String name;
    private String description;
    private String inviteCode;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

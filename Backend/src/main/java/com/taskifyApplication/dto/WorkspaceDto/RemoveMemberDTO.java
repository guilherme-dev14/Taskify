package com.taskifyApplication.dto.WorkspaceDto;

import lombok.Data;

@Data
public class RemoveMemberDTO {
    private Long workspaceId;
    private Long userId;
}
package com.taskifyApplication.dto.WorkspaceDto;

import com.taskifyApplication.model.RoleEnum;
import lombok.Data;

@Data
public class UpdateMemberRoleDTO {
    private Long workspaceId;
    private Long userId;
    private RoleEnum newRole;
}
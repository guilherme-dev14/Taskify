package com.taskifyApplication.dto.WorkspaceDto;

import com.taskifyApplication.model.RoleEnum;
import lombok.Data;

@Data
public class InviteUserDTO {
    private String email;
    private String username;
    private RoleEnum role;
}
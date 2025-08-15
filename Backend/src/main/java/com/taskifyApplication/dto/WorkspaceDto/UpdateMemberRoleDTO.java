package com.taskifyApplication.dto.WorkspaceDto;


import com.taskifyApplication.model.RoleEnum;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class UpdateMemberRoleDTO {
    @NotNull(message = "Role is required")
    private RoleEnum role;
}

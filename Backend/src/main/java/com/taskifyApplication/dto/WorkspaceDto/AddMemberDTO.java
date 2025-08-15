package com.taskifyApplication.dto.WorkspaceDto;

import com.taskifyApplication.model.RoleEnum;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class AddMemberDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Role is required")
    private RoleEnum role = RoleEnum.MEMBER;
}

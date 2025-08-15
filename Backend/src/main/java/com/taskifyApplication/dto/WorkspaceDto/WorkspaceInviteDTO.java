package com.taskifyApplication.dto.WorkspaceDto;


import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class WorkspaceInviteDTO {
    @NotBlank(message = "Invite code is required")
    private String inviteCode;
}

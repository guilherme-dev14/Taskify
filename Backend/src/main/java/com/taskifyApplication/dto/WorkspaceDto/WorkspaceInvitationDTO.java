package com.taskifyApplication.dto.WorkspaceDto;

import com.taskifyApplication.model.RoleEnum;
import com.taskifyApplication.model.WorkspaceInvitation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceInvitationDTO {
    private Long id;
    private Long workspaceId;
    private String workspaceName;
    private String inviterName;
    private String inviterEmail;
    private RoleEnum proposedRole;
    private WorkspaceInvitation.InvitationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
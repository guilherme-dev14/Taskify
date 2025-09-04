package com.taskifyApplication.dto.WorkspaceDto;

import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.model.RoleEnum;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class WorkspaceMembersResponseDTO {
    private Long id;
    private UserSummaryDTO user;
    private RoleEnum role;
    private OffsetDateTime joinedAt;
    private boolean isOwner;
}
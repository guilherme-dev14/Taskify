package com.taskifyApplication.dto.WorkspaceDto;

import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.model.RoleEnum;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class WorkspaceMemberDTO {
    private Long id;
    private Long userId;
    private RoleEnum role;
    private OffsetDateTime joinedAt;


}

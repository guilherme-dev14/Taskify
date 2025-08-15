package com.taskifyApplication.dto.WorkspaceDto;

import com.taskifyApplication.model.RoleEnum;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class WorkspaceMemberDTO {
    private Long id;
    private UserSummaryDTO user;
    private RoleEnum role;
    private OffsetDateTime joinedAt;
    private Boolean isActive;

    // Estatísticas do membro
    private Integer assignedTasks;
    private Integer completedTasks;
    private Double completionRate;
}

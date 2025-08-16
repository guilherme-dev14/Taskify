package com.taskifyApplication.dto.WorkspaceDto;


import com.taskifyApplication.dto.CategoryDto.CategorySummaryDTO;
import com.taskifyApplication.dto.TaskDto.TaskStatsDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class WorkspaceResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Boolean isPublic;
    private String inviteCode;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Relacionamentos
    private UserSummaryDTO owner;
    private List<WorkspaceMemberDTO> members;
    private List<CategorySummaryDTO> categories;

    // Estatísticas
    private Integer memberCount;
    private Integer taskCount;
    private Integer activeTaskCount;
    private TaskStatsDTO taskStats;
}
